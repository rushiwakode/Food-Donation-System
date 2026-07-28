package com.fooddonation.controller;

import com.fooddonation.dto.request.CreateDonationRequest;
import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.DonationResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.entity.FoodDonation;
import com.fooddonation.enums.DonationStatus;
import com.fooddonation.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/donations")
@RequiredArgsConstructor
@Tag(name = "Food Donations", description = "APIs for creating and browsing food donations")
public class DonationController {

	private final DonationService donationService;

	@PostMapping
	@Operation(summary = "Create a new food donation (Donor only)")
	public ResponseEntity<ApiResponse<DonationResponse>> createDonation(Authentication auth,
			@Valid @RequestBody CreateDonationRequest request) {
		DonationResponse response = donationService.createDonation(auth.getName(), request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Donation created successfully and is pending approval", response));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get donation details by ID")
	public ResponseEntity<ApiResponse<DonationResponse>> getDonation(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success(donationService.getDonationById(id)));
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update a donation (Donor only, while pending)")
	public ResponseEntity<ApiResponse<DonationResponse>> updateDonation(@PathVariable Long id, Authentication auth,
			@Valid @RequestBody CreateDonationRequest request) {
		return ResponseEntity.ok(
				ApiResponse.success("Donation updated", donationService.updateDonation(id, auth.getName(), request)));
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete a donation (Donor only)")
	public ResponseEntity<ApiResponse<Void>> deleteDonation(@PathVariable Long id, Authentication auth) {
		donationService.deleteDonation(id, auth.getName());
		return ResponseEntity.ok(ApiResponse.success("Donation deleted", null));
	}

	@PostMapping("/{id}/images")
	@Operation(summary = "Upload images for a donation (max 5)")
	public ResponseEntity<ApiResponse<Void>> uploadImages(@PathVariable Long id, Authentication auth,
			@RequestParam("files") List<MultipartFile> files) {
		donationService.addImages(id, auth.getName(), files);
		return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully", null));
	}

	@GetMapping("/my-donations")
	@Operation(summary = "Get current donor's donation history")
	public ResponseEntity<ApiResponse<PageResponse<DonationResponse>>> getMyDonations(Authentication auth,
			@RequestParam(required = false) DonationStatus status, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return ResponseEntity
				.ok(ApiResponse.success(donationService.getDonationsByDonor(auth.getName(), status, pageable)));
	}

	@GetMapping("/search")
	@Operation(summary = "Search available donations (public, used by NGOs)")
	public ResponseEntity<ApiResponse<PageResponse<DonationResponse>>> searchDonations(
			@RequestParam(required = false, defaultValue = "") String query,
			@RequestParam(required = false) String city, @RequestParam(required = false) Long categoryId,
			@RequestParam(required = false) String foodType, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "expiresAt"));
		return ResponseEntity
				.ok(ApiResponse.success(donationService.searchDonations(query, city, categoryId, foodType, pageable)));
	}
}
