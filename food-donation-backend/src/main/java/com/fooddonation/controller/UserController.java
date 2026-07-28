package com.fooddonation.controller;

import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.dto.response.UserResponse;
import com.fooddonation.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User profile management APIs")
public class UserController {

	private final UserService userService;

	@GetMapping("/me")
	@Operation(summary = "Get current logged-in user's profile")
	public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication auth) {
		return ResponseEntity.ok(ApiResponse.success(userService.getCurrentUser(auth.getName())));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get user profile by ID")
	public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
	}

	@PostMapping("/me/profile-image")
	@Operation(summary = "Upload profile image")
	public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(Authentication auth,
			@RequestParam("file") MultipartFile file) {
		String url = userService.uploadProfileImage(auth.getName(), file);
		return ResponseEntity.ok(ApiResponse.success("Profile image uploaded", Map.of("imageUrl", url)));
	}

	@PutMapping("/me/change-password")
	@Operation(summary = "Change current password")
	public ResponseEntity<ApiResponse<Void>> changePassword(Authentication auth,
			@RequestBody Map<String, String> body) {
		userService.changePassword(auth.getName(), body.get("oldPassword"), body.get("newPassword"));
		return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
	}
}
