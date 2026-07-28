package com.fooddonation.controller;

import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.DashboardStatsResponse;
import com.fooddonation.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-specific dashboard statistics")
public class DashboardController {

	private final DashboardService dashboardService;

	@GetMapping("/donor")
	@Operation(summary = "Get donor dashboard statistics")
	public ResponseEntity<ApiResponse<DashboardStatsResponse>> donorDashboard(Authentication auth) {
		return ResponseEntity.ok(ApiResponse.success(dashboardService.getDonorDashboard(auth.getName())));
	}

	@GetMapping("/ngo")
	@Operation(summary = "Get NGO dashboard statistics")
	public ResponseEntity<ApiResponse<DashboardStatsResponse>> ngoDashboard(Authentication auth) {
		return ResponseEntity.ok(ApiResponse.success(dashboardService.getNgoDashboard(auth.getName())));
	}

	@GetMapping("/agent")
	@Operation(summary = "Get delivery agent dashboard statistics")
	public ResponseEntity<ApiResponse<DashboardStatsResponse>> agentDashboard(Authentication auth) {
		return ResponseEntity.ok(ApiResponse.success(dashboardService.getAgentDashboard(auth.getName())));
	}
}
