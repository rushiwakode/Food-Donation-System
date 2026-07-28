package com.fooddonation.controller;

import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.NotificationResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification APIs")
public class NotificationController {

	private final NotificationService notificationService;

	@GetMapping
	@Operation(summary = "Get current user's notifications")
	public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getMyNotifications(Authentication auth,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return ResponseEntity.ok(ApiResponse.success(notificationService.getMyNotifications(auth.getName(), pageable)));
	}

	@GetMapping("/unread-count")
	@Operation(summary = "Get count of unread notifications")
	public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication auth) {
		long count = notificationService.getUnreadCount(auth.getName());
		return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
	}

	@PutMapping("/{id}/read")
	@Operation(summary = "Mark a notification as read")
	public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id, Authentication auth) {
		notificationService.markAsRead(id, auth.getName());
		return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
	}

	@PutMapping("/read-all")
	@Operation(summary = "Mark all notifications as read")
	public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication auth) {
		notificationService.markAllAsRead(auth.getName());
		return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
	}
}
