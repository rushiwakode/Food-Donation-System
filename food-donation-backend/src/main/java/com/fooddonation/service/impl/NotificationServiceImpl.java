package com.fooddonation.service.impl;

import com.fooddonation.dto.response.NotificationResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.entity.Notification;
import com.fooddonation.entity.User;
import com.fooddonation.enums.NotificationType;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.repository.NotificationRepository;
import com.fooddonation.repository.UserRepository;
import com.fooddonation.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	@Override
	@Async
	@Transactional
	public void sendNotification(User user, String title, String message, NotificationType type, Long referenceId,
			String referenceType) {
		Notification notification = Notification.builder().user(user).title(title).message(message).type(type)
				.isRead(false).referenceId(referenceId).referenceType(referenceType).build();
		notificationRepository.save(notification);
		log.debug("Notification sent to user {}: {}", user.getId(), title);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<NotificationResponse> getMyNotifications(String email, Pageable pageable) {
		User user = getUserByEmail(email);
		Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional(readOnly = true)
	public long getUnreadCount(String email) {
		User user = getUserByEmail(email);
		return notificationRepository.countByUserIdAndIsRead(user.getId(), false);
	}

	@Override
	@Transactional
	public void markAsRead(Long notificationId, String email) {
		User user = getUserByEmail(email);
		notificationRepository.markAsRead(notificationId, user.getId());
	}

	@Override
	@Transactional
	public void markAllAsRead(String email) {
		User user = getUserByEmail(email);
		notificationRepository.markAllAsRead(user.getId());
	}

	private NotificationResponse mapToResponse(Notification n) {
		return NotificationResponse.builder().id(n.getId()).title(n.getTitle()).message(n.getMessage())
				.type(n.getType().name()).isRead(n.getIsRead()).actionUrl(n.getActionUrl())
				.referenceId(n.getReferenceId()).referenceType(n.getReferenceType()).createdAt(n.getCreatedAt())
				.build();
	}

	private User getUserByEmail(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
	}
}
