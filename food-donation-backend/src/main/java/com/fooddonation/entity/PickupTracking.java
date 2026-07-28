package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fooddonation.enums.EventType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pickup_tracking", indexes = @Index(name = "idx_tracking_assignment", columnList = "assignment_id"))
public class PickupTracking {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assignment_id", nullable = false)
	private DeliveryAssignment assignment;

	@Column(precision = 10, scale = 8)
	private BigDecimal latitude;

	@Column(precision = 11, scale = 8)
	private BigDecimal longitude;

	@Column(name = "status_update", length = 255)
	private String statusUpdate;

	@Enumerated(EnumType.STRING)
	@Column(name = "event_type", length = 20)
	@Builder.Default
	private EventType eventType = EventType.LOCATION_UPDATE;

	@Column(name = "tracked_at", updatable = false)
	private LocalDateTime trackedAt;

	@PrePersist
	protected void onCreate() {
		this.trackedAt = LocalDateTime.now();
	}

}
