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
@Table(name = "donation_images", indexes = @Index(name = "idx_img_donation", columnList = "donation_id"))
public class DonationImage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "donation_id", nullable = false)
	private FoodDonation donation;

	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	@Column(name = "image_name", length = 255)
	private String imageName;

	@Column(name = "is_primary")
	@Builder.Default
	private Boolean isPrimary = false;

	@Column(name = "sort_order")
	@Builder.Default
	private Integer sortOrder = 0;

	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
