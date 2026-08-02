package com.fooddonation.entity;

import java.time.LocalDateTime;

import com.fooddonation.enums.*;

import jakarta.persistence.*;
import lombok.*;

/**
 * Tracks requests to change sensitive contact fields (email / phone).
 * Flow: PENDING → APPROVED (admin) → OTP_SENT → COMPLETED
 *                              ↘ REJECTED
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "profile_change_requests", indexes = { @Index(name = "idx_pcr_user", columnList = "user_id"),
		@Index(name = "idx_pcr_status", columnList = "status") })
public class ProfileChangeRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "field_type", nullable = false, length = 10)
	private FieldType fieldType;

	@Column(name = "current_value", nullable = false, length = 200)
	private String currentValue;

	@Column(name = "requested_value", nullable = false, length = 200)
	private String requestedValue;

	@Column(name = "reason", nullable = false, columnDefinition = "TEXT")
	private String reason;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 15)
	@Builder.Default
	private RequestStatus status = RequestStatus.PENDING;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reviewed_by")
	private User reviewedBy;

	@Column(name = "admin_note", columnDefinition = "TEXT")
	private String adminNote;

	@Column(name = "reviewed_at")
	private LocalDateTime reviewedAt;

	@Column(name = "otp_code", length = 6)
	private String otpCode;

	@Column(name = "otp_expires_at")
	private LocalDateTime otpExpiresAt;

	@Column(name = "otp_verified")
	@Builder.Default
	private Boolean otpVerified = false;

	@Column(name = "otp_sent_at")
	private LocalDateTime otpSentAt;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		createdAt = updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public boolean isOtpExpired() {
		return otpExpiresAt == null || LocalDateTime.now().isAfter(otpExpiresAt);
	}
}
