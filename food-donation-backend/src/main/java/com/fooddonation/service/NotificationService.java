package com.fooddonation.service;

import org.springframework.data.domain.Pageable;

import com.fooddonation.dto.response.NotificationResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.entity.User;
import com.fooddonation.enums.NotificationType;

public interface NotificationService {

	void sendNotification(User user, String title, String message, NotificationType type, Long referenceId,
			String referenceType);

	PageResponse<NotificationResponse> getMyNotifications(String email, Pageable pageable);

	long getUnreadCount(String email);

	void markAsRead(Long notificationId, String email);

	void markAllAsRead(String email);

}
