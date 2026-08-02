package com.fooddonation.controller;

import java.util.Map;

import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.fooddonation.dto.request.*;
import com.fooddonation.dto.response.*;
import com.fooddonation.enums.RequestStatus;
import com.fooddonation.service.ProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Profile editing, contact change requests, OTP verification")
public class ProfileController {

    private final ProfileService profileService;

    // ─── USER endpoints ───────────────────────────────────────

    @PutMapping("/basic")
    @Operation(summary = "Instantly update name, address, city, state, pincode")
    public ResponseEntity<ApiResponse<UserResponse>> updateBasicProfile(
            Authentication auth, @Valid @RequestBody UpdateBasicProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                profileService.updateBasicProfile(auth.getName(), request)));
    }

    @PostMapping("/change-request")
    @Operation(summary = "Submit request to change email or phone — admin approval required")
    public ResponseEntity<ApiResponse<ProfileChangeRequestResponse>> submitContactChangeRequest(
            Authentication auth, @Valid @RequestBody ContactChangeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Request submitted. You'll be notified once admin reviews it.",
                profileService.submitContactChangeRequest(auth.getName(), request)));
    }

    @GetMapping("/change-requests/my")
    @Operation(summary = "Get all my contact change requests")
    public ResponseEntity<ApiResponse<PageResponse<ProfileChangeRequestResponse>>> getMyRequests(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getMyChangeRequests(auth.getName(), pageable)));
    }

    /**
     * USER clicks "Send OTP" button in the UI.
     * Request must already be APPROVED by admin.
     * OTP is generated and sent ONLY here — never on admin approval.
     */
    @PostMapping("/change-requests/{id}/send-otp")
    @Operation(summary = "Send OTP to new email/phone — only after admin approved the request")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            Authentication auth, @PathVariable Long id) {
        profileService.sendOtpToUser(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("OTP sent! Check your new email/phone.", null));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and apply the contact change")
    public ResponseEntity<ApiResponse<UserResponse>> verifyOtp(
            Authentication auth, @Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Contact updated successfully!",
                profileService.verifyOtpAndApplyChange(auth.getName(), request)));
    }

    // ─── ADMIN endpoints ──────────────────────────────────────

    @GetMapping("/admin/change-requests")
    @Operation(summary = "Admin — List all contact change requests")
    public ResponseEntity<ApiResponse<PageResponse<ProfileChangeRequestResponse>>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getAllChangeRequests(status, pageable)));
    }

    @PutMapping("/admin/change-requests/{id}/approve")
    @Operation(summary = "Admin approves — status → APPROVED. OTP is NOT sent automatically.")
    public ResponseEntity<ApiResponse<ProfileChangeRequestResponse>> approveRequest(
            Authentication auth, @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.getOrDefault("adminNote", "Approved") : "Approved";
        return ResponseEntity.ok(ApiResponse.success(
                "Request approved. User will be notified to send OTP when ready.",
                profileService.approveChangeRequest(id, note, auth.getName())));
    }

    @PutMapping("/admin/change-requests/{id}/reject")
    @Operation(summary = "Admin rejects a request with reason")
    public ResponseEntity<ApiResponse<ProfileChangeRequestResponse>> rejectRequest(
            Authentication auth, @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String note = body.getOrDefault("adminNote", "Rejected.");
        return ResponseEntity.ok(ApiResponse.success("Request rejected.",
                profileService.rejectChangeRequest(id, note, auth.getName())));
    }
}