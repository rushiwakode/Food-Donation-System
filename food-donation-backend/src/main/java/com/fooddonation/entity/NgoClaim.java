package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fooddonation.enums.ClaimStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ngo_claims", indexes = { @Index(name = "idx_claim_donation", columnList = "donation_id"),
		@Index(name = "idx_claim_ngo", columnList = "ngo_id"),
		@Index(name = "idx_claim_status", columnList = "status") })
public class NgoClaim extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "donation_id", nullable = false)
	private FoodDonation donation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ngo_id", nullable = false)
	private User ngo;

	@Column(name = "claim_message", columnDefinition = "TEXT")
	private String claimMessage;

	@Column(name = "people_count")
	private Integer peopleCount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 15)
	@Builder.Default
	private ClaimStatus status = ClaimStatus.PENDING;

	@Column(name = "claimed_at")
	private LocalDateTime claimedAt;

	@Column(name = "approved_at")
	private LocalDateTime approvedAt;

	@Column(name = "rejected_at")
	private LocalDateTime rejectedAt;

	@Column(name = "reject_reason", columnDefinition = "TEXT")
	private String rejectReason;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	@OneToOne(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private DeliveryAssignment deliveryAssignment;

	@PrePersist
	protected void onCreate() {
		claimedAt = LocalDateTime.now();
	}

}
