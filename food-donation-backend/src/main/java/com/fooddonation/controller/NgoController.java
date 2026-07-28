package com.fooddonation.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fooddonation.dto.request.ClaimRequest;
import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.ClaimResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.enums.ClaimStatus;
import com.fooddonation.service.NgoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ngo")
@RequiredArgsConstructor
@Tag(name = "NGO", description = "APIs for NGOs to claim and track food donations")
public class NgoController {

	private final NgoService ngoService;

	@PostMapping("/claims")
	@Operation(summary = "Claim a food donation (NGO only)")
	public ResponseEntity<ApiResponse<ClaimResponse>> claimDonation(Authentication auth,
			@Valid @RequestBody ClaimRequest request) {
		ClaimResponse response = ngoService.claimDonation(auth.getName(), request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Donation claimed successfully", response));
	}

	@DeleteMapping("/claims/{id}")
	@Operation(summary = "Cancel a claim")
	public ResponseEntity<ApiResponse<Void>> cancelClaim(@PathVariable Long id, Authentication auth) {
		ngoService.cancelClaim(id, auth.getName());
		return ResponseEntity.ok(ApiResponse.success("Claim cancelled", null));
	}

	@GetMapping("/claims/{id}")
	@Operation(summary = "Get claim details by ID")
	public ResponseEntity<ApiResponse<ClaimResponse>> getClaim(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success(ngoService.getClaimById(id)));
	}

	@GetMapping("/claims/my-claims")
	@Operation(summary = "Get current NGO's claim history")
	public ResponseEntity<ApiResponse<PageResponse<ClaimResponse>>> getMyClaims(Authentication auth,
			@RequestParam(required = false) ClaimStatus status, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "claimedAt"));
		return ResponseEntity.ok(ApiResponse.success(ngoService.getMyClaims(auth.getName(), status, pageable)));
	}
}
