package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fooddonation.enums.AssignmentStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "delivery_assignments", indexes = { @Index(name = "idx_da_claim", columnList = "claim_id"),
		@Index(name = "idx_da_agent", columnList = "agent_id"), @Index(name = "idx_da_status", columnList = "status") })
public class DeliveryAssignment extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "claim_id", nullable = false, unique = true)
	private NgoClaim claim;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "donation_id", nullable = false)
	private FoodDonation donation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "agent_id")
	private User agent;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_by")
	private User assignedBy;

	@Column(name = "pickup_otp", length = 6)
	private String pickupOtp;

	@Column(name = "delivery_otp", length = 6)
	private String deliveryOtp;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private AssignmentStatus status = AssignmentStatus.UNASSIGNED;

	@Column(name = "assigned_at")
	private LocalDateTime assignedAt;

	@Column(name = "pickup_started_at")
	private LocalDateTime pickupStartedAt;

	@Column(name = "picked_up_at")
	private LocalDateTime pickedUpAt;

	@Column(name = "delivered_at")
	private LocalDateTime deliveredAt;

	@Column(name = "failed_reason", columnDefinition = "TEXT")
	private String failedReason;

	@Column(name = "agent_notes", columnDefinition = "TEXT")
	private String agentNotes;

	@Column(name = "distance_km", precision = 8, scale = 2)
	private BigDecimal distanceKm;

	@OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<PickupTracking> trackingHistory = new ArrayList<>();

}
