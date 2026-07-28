package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fooddonation.enums.NotificationType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications", indexes = { @Index(name = "idx_notif_user", columnList = "user_id"),
		@Index(name = "idx_notif_is_read", columnList = "is_read") })
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String message;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 15)
	@Builder.Default
	private NotificationType type = NotificationType.INFO;

	@Column(name = "is_read")
	@Builder.Default
	private Boolean isRead = false;

	@Column(name = "action_url", length = 500)
	private String actionUrl;

	@Column(name = "reference_id")
	private Long referenceId;

	@Column(name = "reference_type", length = 50)
	private String referenceType;

	@Column(name = "sent_email")
	@Builder.Default
	private Boolean sentEmail = false;

	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
