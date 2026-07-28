package com.fooddonation.controller;

import com.fooddonation.dto.request.*;
import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.AuthResponse;
import com.fooddonation.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Registration, login, and password management APIs")
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
	@Operation(summary = "Register a new user (Donor, NGO, or Delivery Agent)")
	public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
		AuthResponse response = authService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Registration successful", response));
	}

	@PostMapping("/login")
	@Operation(summary = "Login with email and password")
	public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
		AuthResponse response = authService.login(request);
		return ResponseEntity.ok(ApiResponse.success("Login successful", response));
	}

	@PostMapping("/refresh-token")
	@Operation(summary = "Refresh access token using refresh token")
	public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody Map<String, String> body) {
		AuthResponse response = authService.refreshToken(body.get("refreshToken"));
		return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
	}

	@PostMapping("/logout")
	@Operation(summary = "Logout and invalidate refresh tokens")
	public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
		String token = authHeader.replace("Bearer ", "");
		authService.logout(token);
		return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
	}

	@PostMapping("/forgot-password")
	@Operation(summary = "Request a password reset link")
	public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		authService.forgotPassword(request);
		return ResponseEntity.ok(
				ApiResponse.success("If an account exists with this email, a password reset link has been sent", null));
	}

	@PostMapping("/reset-password")
	@Operation(summary = "Reset password using token")
	public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		authService.resetPassword(request);
		return ResponseEntity
				.ok(ApiResponse.success("Password reset successful. Please login with your new password", null));
	}

	@GetMapping("/verify-email")
	@Operation(summary = "Verify email address using token")
	public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
		authService.verifyEmail(token);
		return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
	}
}
