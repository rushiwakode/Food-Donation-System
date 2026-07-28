package com.fooddonation.controller;

import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.DeliveryResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.enums.AssignmentStatus;
import com.fooddonation.service.DeliveryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/delivery")
@RequiredArgsConstructor
@Tag(name = "Delivery", description = "APIs for delivery agents to manage pickups and deliveries")
public class DeliveryController {

	private final DeliveryService deliveryService;

	@GetMapping("/{id}")
	@Operation(summary = "Get delivery assignment details")
	public ResponseEntity<ApiResponse<DeliveryResponse>> getDelivery(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success(deliveryService.getById(id)));
	}

	@PutMapping("/{id}/status")
	@Operation(summary = "Update delivery status (agent only)")
	public ResponseEntity<ApiResponse<DeliveryResponse>> updateStatus(@PathVariable Long id, Authentication auth,
			@RequestBody Map<String, String> body) {
		AssignmentStatus status = AssignmentStatus.valueOf(body.get("status"));
		String notes = body.get("notes");
		return ResponseEntity.ok(
				ApiResponse.success("Status updated", deliveryService.updateStatus(id, auth.getName(), status, notes)));
	}

	@PostMapping("/{id}/confirm-pickup")
	@Operation(summary = "Confirm pickup using OTP")
	public ResponseEntity<ApiResponse<DeliveryResponse>> confirmPickup(@PathVariable Long id, Authentication auth,
			@RequestBody Map<String, String> body) {
		return ResponseEntity.ok(ApiResponse.success("Pickup confirmed",
				deliveryService.confirmPickup(id, auth.getName(), body.get("otp"))));
	}

	@PostMapping("/{id}/confirm-delivery")
	@Operation(summary = "Confirm delivery using OTP")
	public ResponseEntity<ApiResponse<DeliveryResponse>> confirmDelivery(@PathVariable Long id, Authentication auth,
			@RequestBody Map<String, String> body) {
		return ResponseEntity.ok(ApiResponse.success("Delivery confirmed",
				deliveryService.confirmDelivery(id, auth.getName(), body.get("otp"))));
	}

	@GetMapping("/my-deliveries")
	@Operation(summary = "Get current agent's delivery history")
	public ResponseEntity<ApiResponse<PageResponse<DeliveryResponse>>> getMyDeliveries(Authentication auth,
			@RequestParam(required = false) AssignmentStatus status, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return ResponseEntity
				.ok(ApiResponse.success(deliveryService.getMyDeliveries(auth.getName(), status, pageable)));
	}
}
