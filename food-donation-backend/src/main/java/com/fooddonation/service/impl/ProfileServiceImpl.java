package com.fooddonation.service.impl;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fooddonation.dto.request.*;
import com.fooddonation.dto.response.*;
import com.fooddonation.entity.*;
import com.fooddonation.enums.*;
import com.fooddonation.exception.*;
import com.fooddonation.repository.*;
import com.fooddonation.service.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository                 userRepository;
    private final ProfileChangeRequestRepository changeRequestRepository;
    private final NotificationService            notificationService;

    // ─── Update basic profile (instant) ──────────────────────
    @Override
    @Transactional
    public UserResponse updateBasicProfile(String email, UpdateBasicProfileRequest request) {
        User user = getUserByEmail(email);
        if (request.getFullName() != null && !request.getFullName().isBlank())
            user.setFullName(request.getFullName().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        if (request.getCity()    != null) user.setCity(request.getCity().trim());
        if (request.getState()   != null) user.setState(request.getState().trim());
        if (request.getPincode() != null) user.setPincode(request.getPincode().trim());
        return mapUserToResponse(userRepository.save(user));
    }

    // ─── Submit contact change request ────────────────────────
    @Override
    @Transactional
    public ProfileChangeRequestResponse submitContactChangeRequest(
            String email, ContactChangeRequest request) {

        User user = getUserByEmail(email);

        changeRequestRepository
            .findActivePendingByUserAndField(user.getId(), request.getFieldType())
            .ifPresent(e -> { throw new ConflictException(
                "You already have an active " + request.getFieldType() + " change request (ID: "
                + e.getId() + "). Wait for it to be resolved."); });

        if (request.getFieldType() == FieldType.EMAIL) {
            if (userRepository.existsByEmail(request.getNewValue()))
                throw new ConflictException("This email is already registered with another account.");
        } else {
            if (userRepository.existsByPhone(request.getNewValue()))
                throw new ConflictException("This phone number is already registered.");
        }

        String current = request.getFieldType() == FieldType.EMAIL
                ? user.getEmail() : user.getPhone();

        ProfileChangeRequest saved = changeRequestRepository.save(
            ProfileChangeRequest.builder()
                .user(user).fieldType(request.getFieldType())
                .currentValue(current != null ? current : "")
                .requestedValue(request.getNewValue().trim())
                .reason(request.getReason().trim())
                .status(RequestStatus.PENDING)
                .build());

        notificationService.sendNotification(user,
            "Change Request Submitted",
            "Your request to change your " + request.getFieldType().name().toLowerCase()
            + " to '" + request.getNewValue() + "' has been submitted. Awaiting admin review.",
            NotificationType.SYSTEM, saved.getId(), "PROFILE_CHANGE");

        log.info("Contact change request #{} submitted by {} for {}", saved.getId(), email, request.getFieldType());
        return mapToResponse(saved);
    }

    // ─── Get my change requests ───────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProfileChangeRequestResponse> getMyChangeRequests(String email, Pageable pageable) {
        User user = getUserByEmail(email);
        Page<ProfileChangeRequest> page = changeRequestRepository.findByUserId(user.getId(), pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    // ─── USER clicks "Send OTP" button ───────────────────────
    // OTP is ONLY sent here — never automatically on admin approval
    @Override
    @Transactional
    public void sendOtpToUser(Long requestId, String userEmail) {
        ProfileChangeRequest req = getRequestById(requestId);

        if (!req.getUser().getEmail().equals(userEmail))
            throw new UnauthorizedException("Access denied");

        if (req.getStatus() != RequestStatus.APPROVED
                && req.getStatus() != RequestStatus.OTP_SENT)
            throw new BadRequestException(
                "OTP can only be sent for APPROVED requests. Current status: " + req.getStatus());

        // Rate-limit: 60 seconds between sends
        if (req.getOtpSentAt() != null
                && req.getOtpSentAt().isAfter(LocalDateTime.now().minusSeconds(60)))
            throw new BadRequestException("Please wait 60 seconds before requesting a new OTP.");

        generateAndSendOtp(req);
        req.setStatus(RequestStatus.OTP_SENT);
        changeRequestRepository.save(req);
        log.info("OTP sent for request #{} by user {}", requestId, userEmail);
    }

    // ─── Verify OTP and apply change ─────────────────────────
    @Override
    @Transactional
    public UserResponse verifyOtpAndApplyChange(String email, VerifyOtpRequest request) {
        User user = getUserByEmail(email);
        ProfileChangeRequest req = getRequestById(request.getRequestId());

        if (!req.getUser().getId().equals(user.getId()))
            throw new UnauthorizedException("Access denied");

        if (req.getStatus() != RequestStatus.OTP_SENT)
            throw new BadRequestException(
                "OTP not sent yet. Please click 'Send OTP' first. Status: " + req.getStatus());

        if (req.isOtpExpired()) {
            changeRequestRepository.save(req); // keep OTP_SENT so user can resend
            throw new BadRequestException("OTP has expired. Please click 'Resend OTP' to get a new one.");
        }

        if (!req.getOtpCode().equals(request.getOtp().trim()))
            throw new BadRequestException("Invalid OTP. Please check and try again.");

        // Apply the change
        if (req.getFieldType() == FieldType.EMAIL) {
            user.setEmail(req.getRequestedValue());
            user.setEmailVerified(true);
        } else {
            user.setPhone(req.getRequestedValue());
        }

        req.setStatus(RequestStatus.COMPLETED);
        req.setOtpVerified(true);
        changeRequestRepository.save(req);
        User saved = userRepository.save(user);

        notificationService.sendNotification(saved,
            req.getFieldType().name() + " Updated Successfully",
            "Your " + req.getFieldType().name().toLowerCase()
            + " has been changed to: " + req.getRequestedValue(),
            NotificationType.SYSTEM, req.getId(), "PROFILE_CHANGE");

        log.info("Contact change applied — user: {}, field: {}, new: {}",
            email, req.getFieldType(), req.getRequestedValue());
        return mapUserToResponse(saved);
    }

    // ─── Admin: get all requests ──────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProfileChangeRequestResponse> getAllChangeRequests(
            RequestStatus status, Pageable pageable) {
        Page<ProfileChangeRequest> page = (status != null)
                ? changeRequestRepository.findByStatus(status, pageable)
                : changeRequestRepository.findAll(pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    // ─── Admin: APPROVE → status becomes APPROVED, OTP NOT sent ─
    @Override
    @Transactional
    public ProfileChangeRequestResponse approveChangeRequest(
            Long requestId, String adminNote, String adminEmail) {

        ProfileChangeRequest req = getRequestById(requestId);
        if (req.getStatus() != RequestStatus.PENDING)
            throw new BadRequestException("Only PENDING requests can be approved. Status: " + req.getStatus());

        User admin = getUserByEmail(adminEmail);
        req.setStatus(RequestStatus.APPROVED); // ← NOT OTP_SENT
        req.setReviewedBy(admin);
        req.setAdminNote(adminNote);
        req.setReviewedAt(LocalDateTime.now());
        ProfileChangeRequest saved = changeRequestRepository.save(req);

        // Notify user to go click "Send OTP" themselves
        notificationService.sendNotification(req.getUser(),
            req.getFieldType().name() + " Change Request Approved ✅",
            "Your request to change your " + req.getFieldType().name().toLowerCase()
            + " to '" + req.getRequestedValue() + "' was approved. "
            + "Go to Profile → My Requests and click 'Send OTP' to continue.",
            NotificationType.SYSTEM, saved.getId(), "PROFILE_CHANGE");

        log.info("Request #{} APPROVED by {} — user must click Send OTP manually", requestId, adminEmail);
        return mapToResponse(saved);
    }

    // ─── Admin: REJECT ────────────────────────────────────────
    @Override
    @Transactional
    public ProfileChangeRequestResponse rejectChangeRequest(
            Long requestId, String adminNote, String adminEmail) {

        ProfileChangeRequest req = getRequestById(requestId);
        if (req.getStatus() != RequestStatus.PENDING)
            throw new BadRequestException("Only PENDING requests can be rejected. Status: " + req.getStatus());

        User admin = getUserByEmail(adminEmail);
        req.setStatus(RequestStatus.REJECTED);
        req.setReviewedBy(admin);
        req.setAdminNote(adminNote != null ? adminNote : "Rejected by admin.");
        req.setReviewedAt(LocalDateTime.now());
        ProfileChangeRequest saved = changeRequestRepository.save(req);

        notificationService.sendNotification(req.getUser(),
            req.getFieldType().name() + " Change Request Rejected",
            "Your request to change your " + req.getFieldType().name().toLowerCase()
            + " was rejected. Reason: " + req.getAdminNote(),
            NotificationType.ALERT, saved.getId(), "PROFILE_CHANGE");

        log.info("Request #{} REJECTED by {}", requestId, adminEmail);
        return mapToResponse(saved);
    }

    // ─── Private helpers ──────────────────────────────────────

    private void generateAndSendOtp(ProfileChangeRequest req) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        req.setOtpCode(otp);
        req.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        req.setOtpSentAt(LocalDateTime.now());

        // TODO: Wire real email/SMS service here
        // EMAIL → javaMailSender.send(req.getRequestedValue(), otp)
        // PHONE → smsService.send(req.getRequestedValue(), otp)
        log.info("====================================================");
        log.info("  OTP for request #{} ({}): {}  →  {}", req.getId(), req.getFieldType(), otp, req.getRequestedValue());
        log.info("====================================================");
    }

    private ProfileChangeRequest getRequestById(Long id) {
        return changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change request", id));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private ProfileChangeRequestResponse mapToResponse(ProfileChangeRequest r) {
        return ProfileChangeRequestResponse.builder()
                .id(r.getId()).userId(r.getUser().getId())
                .userFullName(r.getUser().getFullName()).userEmail(r.getUser().getEmail())
                .fieldType(r.getFieldType().name()).currentValue(r.getCurrentValue())
                .requestedValue(r.getRequestedValue()).reason(r.getReason())
                .status(r.getStatus().name()).adminNote(r.getAdminNote())
                .reviewedBy(r.getReviewedBy() != null ? r.getReviewedBy().getFullName() : null)
                .reviewedAt(r.getReviewedAt()).otpSentAt(r.getOtpSentAt())
                .otpVerified(r.getOtpVerified()).createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt())
                .build();
    }

    private UserResponse mapUserToResponse(User u) {
        return UserResponse.builder().id(u.getId()).fullName(u.getFullName())
                .email(u.getEmail()).phone(u.getPhone()).address(u.getAddress())
                .city(u.getCity()).state(u.getState()).pincode(u.getPincode())
                .status(u.getStatus().name()).emailVerified(u.getEmailVerified())
                .roles(u.getRoles().stream().map(Role::getName).toList()).build();
    }
}