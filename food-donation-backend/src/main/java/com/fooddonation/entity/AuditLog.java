package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "audit_logs", indexes = { @Index(name = "idx_audit_user", columnList = "user_id"),
		@Index(name = "idx_audit_entity", columnList = "entity_type,entity_id"),
		@Index(name = "idx_audit_created_at", columnList = "created_at") })
public class AuditLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(nullable = false, length = 100)
	private String action;
	@Column(name = "entity_type", nullable = false, length = 100)
	private String entityType;
	@Column(name = "entity_id")
	private Long entityId;

	@Column(name = "old_value", columnDefinition = "JSON")
	private String oldValue;
	@Column(name = "new_value", columnDefinition = "JSON")
	private String newValue;

	@Column(name = "ip_address", length = 45)
	private String ipAddress;
	@Column(name = "user_agent", length = 500)
	private String userAgent;
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}
}
