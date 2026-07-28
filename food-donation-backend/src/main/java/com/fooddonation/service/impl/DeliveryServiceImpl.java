package com.fooddonation.service.impl;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fooddonation.dto.response.DeliveryResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.entity.DeliveryAssignment;
import com.fooddonation.entity.FoodDonation;
import com.fooddonation.entity.NgoClaim;
import com.fooddonation.entity.User;
import com.fooddonation.enums.AssignmentStatus;
import com.fooddonation.enums.ClaimStatus;
import com.fooddonation.enums.DonationStatus;
import com.fooddonation.enums.NotificationType;
import com.fooddonation.exception.BadRequestException;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.exception.UnauthorizedException;
import com.fooddonation.repository.DeliveryAgentProfileRepository;
import com.fooddonation.repository.DeliveryAssignmentRepository;
import com.fooddonation.repository.NgoClaimRepository;
import com.fooddonation.repository.UserRepository;
import com.fooddonation.service.DeliveryService;
import com.fooddonation.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

	private final DeliveryAssignmentRepository assignmentRepository;
	private final NgoClaimRepository claimRepository;
	private final UserRepository userRepository;
	private final DeliveryAgentProfileRepository agentProfileRepository;
	private final NotificationService notificationService;

	@Override
	@Transactional
	public DeliveryResponse assignAgent(Long claimId, Long agentId, String adminEmail) {
		DeliveryAssignment assignment = assignmentRepository.findByClaimId(claimId).orElseThrow(
				() -> new ResourceNotFoundException("Delivery assignment not found for claim: " + claimId));
		User agent = userRepository.findById(agentId)
				.orElseThrow(() -> new ResourceNotFoundException("Agent", agentId));

		assignment.setAgent(agent);
		assignment.setStatus(AssignmentStatus.ASSIGNED);
		assignment.setAssignedAt(LocalDateTime.now());
		assignment.setPickupOtp(generateOtp());
		assignment.setDeliveryOtp(generateOtp());
		DeliveryAssignment saved = assignmentRepository.save(assignment);

		notificationService.sendNotification(agent, "New Delivery Assignment",
				"You have been assigned to pick up: " + assignment.getDonation().getTitle() + " from "
						+ assignment.getDonation().getPickupAddress(),
				NotificationType.DELIVERY, saved.getId(), "DELIVERY");

		notificationService.sendNotification(assignment.getClaim().getNgo(), "Delivery Agent Assigned",
				"A delivery agent has been assigned for your claim. Agent: " + agent.getFullName(),
				NotificationType.DELIVERY, saved.getId(), "DELIVERY");

		log.info("Agent {} assigned to delivery {}", agentId, saved.getId());
		return mapToResponse(saved);
	}

	@Override
	@Transactional
	public DeliveryResponse updateStatus(Long assignmentId, String agentEmail, AssignmentStatus status, String notes) {
		DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Delivery", assignmentId));

		if (assignment.getAgent() == null || !assignment.getAgent().getEmail().equals(agentEmail)) {
			throw new UnauthorizedException("This delivery is not assigned to you");
		}

		assignment.setStatus(status);
		if (notes != null)
			assignment.setAgentNotes(notes);

		switch (status) {
		case PICKUP_STARTED -> assignment.setPickupStartedAt(LocalDateTime.now());
		case PICKED_UP -> assignment.setPickedUpAt(LocalDateTime.now());
		case DELIVERED -> {
			assignment.setDeliveredAt(LocalDateTime.now());
			completeDelivery(assignment);
		}
		case FAILED -> assignment.setFailedReason(notes);
		default -> {
		}
		}

		return mapToResponse(assignmentRepository.save(assignment));
	}

	@Override
	@Transactional
	public DeliveryResponse confirmPickup(Long assignmentId, String agentEmail, String otp) {
		DeliveryAssignment assignment = getAssignmentForAgent(assignmentId, agentEmail);
		if (!otp.equals(assignment.getPickupOtp())) {
			throw new BadRequestException("Invalid pickup OTP");
		}
		assignment.setStatus(AssignmentStatus.PICKED_UP);
		assignment.setPickedUpAt(LocalDateTime.now());
		assignment.getDonation().setStatus(DonationStatus.PICKED_UP);
		return mapToResponse(assignmentRepository.save(assignment));
	}

	@Override
	@Transactional
	public DeliveryResponse confirmDelivery(Long assignmentId, String agentEmail, String otp) {
		DeliveryAssignment assignment = getAssignmentForAgent(assignmentId, agentEmail);
		if (!otp.equals(assignment.getDeliveryOtp())) {
			throw new BadRequestException("Invalid delivery OTP");
		}
		assignment.setStatus(AssignmentStatus.DELIVERED);
		assignment.setDeliveredAt(LocalDateTime.now());
		completeDelivery(assignment);
		return mapToResponse(assignmentRepository.save(assignment));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<DeliveryResponse> getMyDeliveries(String agentEmail, AssignmentStatus status,
			Pageable pageable) {
		User agent = getUserByEmail(agentEmail);
		Page<DeliveryAssignment> page = status != null
				? assignmentRepository.findByAgentIdAndStatus(agent.getId(), status, pageable)
				: assignmentRepository.findByAgentId(agent.getId(), pageable);
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<DeliveryResponse> getAllDeliveries(AssignmentStatus status, Pageable pageable) {
		Page<DeliveryAssignment> page = (status != null) ? assignmentRepository.findByStatus(status, pageable)
				: assignmentRepository.findAll(pageable);
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional(readOnly = true)
	public DeliveryResponse getById(Long id) {
		return mapToResponse(
				assignmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Delivery", id)));
	}

	private void completeDelivery(DeliveryAssignment assignment) {
		FoodDonation donation = assignment.getDonation();
		donation.setStatus(DonationStatus.DELIVERED);
		NgoClaim claim = assignment.getClaim();
		claim.setStatus(ClaimStatus.COMPLETED);
		claim.setCompletedAt(LocalDateTime.now());

		notificationService.sendNotification(
				donation.getDonor(), "Donation Delivered!", "Your donation '" + donation.getTitle()
						+ "' has been successfully delivered to " + claim.getNgo().getFullName(),
				NotificationType.DONATION, donation.getId(), "DONATION");

		notificationService.sendNotification(claim.getNgo(), "Food Received!",
				"The donation '" + donation.getTitle() + "' has been delivered. Thank you!", NotificationType.DELIVERY,
				assignment.getId(), "DELIVERY");
	}

	private DeliveryAssignment getAssignmentForAgent(Long assignmentId, String agentEmail) {
		DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Delivery", assignmentId));
		if (assignment.getAgent() == null || !assignment.getAgent().getEmail().equals(agentEmail)) {
			throw new UnauthorizedException("This delivery is not assigned to you");
		}
		return assignment;
	}

	private DeliveryResponse mapToResponse(DeliveryAssignment da) {
		return DeliveryResponse.builder().id(da.getId()).claimId(da.getClaim() != null ? da.getClaim().getId() : null)
				.donationId(da.getDonation().getId()).donationTitle(da.getDonation().getTitle())
				.pickupAddress(da.getDonation().getPickupAddress()).pickupCity(da.getDonation().getPickupCity())
				.agentId(da.getAgent() != null ? da.getAgent().getId() : null)
				.agentName(da.getAgent() != null ? da.getAgent().getFullName() : null)
				.agentPhone(da.getAgent() != null ? da.getAgent().getPhone() : null).status(da.getStatus().name())
				.assignedAt(da.getAssignedAt()).pickedUpAt(da.getPickedUpAt()).deliveredAt(da.getDeliveredAt())
				.distanceKm(da.getDistanceKm()).build();
	}

	private String generateOtp() {
		return String.format("%06d", new Random().nextInt(999999));
	}

	private User getUserByEmail(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
	}
}
