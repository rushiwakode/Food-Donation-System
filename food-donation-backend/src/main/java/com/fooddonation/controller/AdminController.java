package com.fooddonation.controller;

import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.ClaimResponse;
import com.fooddonation.dto.response.DashboardStatsResponse;
import com.fooddonation.dto.response.DeliveryResponse;
import com.fooddonation.dto.response.DonationResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.dto.response.UserResponse;
import com.fooddonation.enums.AssignmentStatus;
import com.fooddonation.enums.ClaimStatus;
import com.fooddonation.enums.DonationStatus;
import com.fooddonation.enums.UserStatus;
import com.fooddonation.service.DashboardService;
import com.fooddonation.service.DeliveryService;
import com.fooddonation.service.DonationService;
import com.fooddonation.service.NgoService;
import com.fooddonation.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrative APIs for managing the entire system")
public class AdminController {

	private final UserService userService;
	private final DonationService donationService;
	private final NgoService ngoService;
	private final DeliveryService deliveryService;
	private final DashboardService dashboardService;

	// ===== Dashboard =====

	@GetMapping("/dashboard")
	@Operation(summary = "Get admin dashboard statistics")
	public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
		return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboard()));
	}

	// ===== User Management =====

	@GetMapping("/users")
	@Operation(summary = "Get all users with optional role/search filters")
	public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
			@RequestParam(required = false) String role, @RequestParam(required = false) String query,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(role, query, pageable)));
	}

	@PutMapping("/users/{id}/status")
	@Operation(summary = "Update a user's account status (ACTIVE/BLOCKED/INACTIVE)")
	public ResponseEntity<ApiResponse<Void>> updateUserStatus(@PathVariable Long id,
			@RequestBody Map<String, String> body) {
		userService.updateUserStatus(id, UserStatus.valueOf(body.get("status")));
		return ResponseEntity.ok(ApiResponse.success("User status updated", null));
	}

	@PutMapping("/users/{id}/approve-ngo")
	@Operation(summary = "Approve and verify an NGO account")
	public ResponseEntity<ApiResponse<UserResponse>> approveNgo(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success("NGO approved", userService.approveNgo(id)));
	}

	@PutMapping("/users/{id}/approve-donor")
	@Operation(summary = "Approve a donor account")
	public ResponseEntity<ApiResponse<UserResponse>> approveDonor(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success("Donor approved", userService.approveDonor(id)));
	}

	@DeleteMapping("/users/{id}")
	@Operation(summary = "Delete a user account")
	public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
		return ResponseEntity.ok(ApiResponse.success("User deleted", null));
	}

	// ===== Donation Management =====

	@GetMapping("/donations")
	@Operation(summary = "Get all donations with optional status filter")
	public ResponseEntity<ApiResponse<PageResponse<DonationResponse>>> getAllDonations(
			@RequestParam(required = false) DonationStatus status, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return ResponseEntity.ok(ApiResponse.success(donationService.getAllDonations(status, pageable)));
	}

	@PutMapping("/donations/{id}/approve")
	@Operation(summary = "Approve a pending donation")
	public ResponseEntity<ApiResponse<DonationResponse>> approveDonation(@PathVariable Long id, Authentication auth) {
		return ResponseEntity
				.ok(ApiResponse.success("Donation approved", donationService.approveDonation(id, auth.getName())));
	}

	@PutMapping("/donations/{id}/reject")
	@Operation(summary = "Reject a pending donation with a reason")
	public ResponseEntity<ApiResponse<DonationResponse>> rejectDonation(@PathVariable Long id, Authentication auth,
			@RequestBody Map<String, String> body) {
		return ResponseEntity.ok(ApiResponse.success("Donation rejected",
				donationService.rejectDonation(id, body.get("reason"), auth.getName())));
	}

	// ===== Claim Management =====

	@GetMapping("/claims")
	@Operation(summary = "Get all NGO claims")
	public ResponseEntity<ApiResponse<PageResponse<ClaimResponse>>> getAllClaims(
			@RequestParam(required = false) ClaimStatus status, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "claimedAt"));
		return ResponseEntity.ok(ApiResponse.success(ngoService.getAllClaims(status, pageable)));
	}

	@PutMapping("/claims/{id}/approve")
	@Operation(summary = "Approve an NGO claim and create delivery assignment")
	public ResponseEntity<ApiResponse<ClaimResponse>> approveClaim(@PathVariable Long id, Authentication auth) {
		return ResponseEntity.ok(ApiResponse.success("Claim approved", ngoService.approveClaim(id, auth.getName())));
	}

	@PutMapping("/claims/{id}/reject")
	@Operation(summary = "Reject an NGO claim with a reason")
	public ResponseEntity<ApiResponse<ClaimResponse>> rejectClaim(@PathVariable Long id, Authentication auth,
			@RequestBody Map<String, String> body) {
		return ResponseEntity.ok(
				ApiResponse.success("Claim rejected", ngoService.rejectClaim(id, body.get("reason"), auth.getName())));
	}

	// ===== Delivery Management =====

	@GetMapping("/deliveries")
	@Operation(summary = "Get all delivery assignments")
	public ResponseEntity<ApiResponse<PageResponse<DeliveryResponse>>> getAllDeliveries(
			@RequestParam(required = false) AssignmentStatus status, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return ResponseEntity.ok(ApiResponse.success(deliveryService.getAllDeliveries(status, pageable)));
	}

	@PostMapping("/deliveries/claims/{claimId}/assign")
	@Operation(summary = "Assign a delivery agent to an approved claim")
	public ResponseEntity<ApiResponse<DeliveryResponse>> assignAgent(@PathVariable Long claimId, Authentication auth,
			@RequestBody Map<String, Long> body) {
		return ResponseEntity.ok(ApiResponse.success("Agent assigned",
				deliveryService.assignAgent(claimId, body.get("agentId"), auth.getName())));
	}
}
