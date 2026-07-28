package com.fooddonation.entity;

import com.fooddonation.enums.ReviewType;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reviews", uniqueConstraints = @UniqueConstraint(name = "uq_review_donor_type", columnNames = {
		"donation_id", "reviewer_id", "review_type" }), indexes = {
				@Index(name = "idx_review_donation", columnList = "donation_id"),
				@Index(name = "idx_review_reviewee", columnList = "reviewee_id") })
public class Review extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "donation_id", nullable = false)
	private FoodDonation donation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reviewer_id", nullable = false)
	private User reviewer;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reviewee_id", nullable = false)
	private User reviewee;

	@Column(nullable = false)
	private Integer rating;

	@Column(columnDefinition = "TEXT")
	private String comment;

	@Enumerated(EnumType.STRING)
	@Column(name = "review_type", nullable = false, length = 20)
	private ReviewType reviewType;

}
