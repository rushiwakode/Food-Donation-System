package com.fooddonation.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fooddonation.enums.DonationStatus;
import com.fooddonation.enums.FoodType;
import com.fooddonation.enums.QuantityUnit;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "food_donations", indexes = { @Index(name = "idx_donation_donor", columnList = "donor_id"),
		@Index(name = "idx_donation_status", columnList = "status"),
		@Index(name = "idx_donation_city", columnList = "pickup_city"),
		@Index(name = "idx_donation_expires", columnList = "expires_at"),
		@Index(name = "idx_donation_category", columnList = "category_id") })
public class FoodDonation extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "donor_id", nullable = false)
	private User donor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id")
	private FoodCategory category;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "food_type", nullable = false, length = 10)
	@Builder.Default
	private FoodType foodType = FoodType.VEG;

	@Column(nullable = false)
	private Integer quantity;

	@Enumerated(EnumType.STRING)
	@Column(name = "quantity_unit", length = 10)
	@Builder.Default
	private QuantityUnit quantityUnit = QuantityUnit.SERVINGS;

	@Column(name = "prepared_at", nullable = false)
	private LocalDateTime preparedAt;

	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;

	@Column(name = "pickup_address", nullable = false, columnDefinition = "TEXT")
	private String pickupAddress;

	@Column(name = "pickup_city", nullable = false, length = 100)
	private String pickupCity;

	@Column(name = "pickup_state", length = 100)
	private String pickupState;

	@Column(name = "pickup_pincode", length = 10)
	private String pickupPincode;

	@Column(name = "pickup_latitude", precision = 10, scale = 8)
	private BigDecimal pickupLatitude;

	@Column(name = "pickup_longitude", precision = 11, scale = 8)
	private BigDecimal pickupLongitude;

	@Column(name = "pickup_instructions", columnDefinition = "TEXT")
	private String pickupInstructions;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private DonationStatus status = DonationStatus.PENDING;

	@Column(name = "is_perishable")
	@Builder.Default
	private Boolean isPerishable = true;

	@Column(name = "allergen_info", length = 500)
	private String allergenInfo;

	@Column(name = "special_notes", columnDefinition = "TEXT")
	private String specialNotes;

	@Column(name = "admin_notes", columnDefinition = "TEXT")
	private String adminNotes;

	@Column(name = "rejected_reason", columnDefinition = "TEXT")
	private String rejectedReason;

	@Column(name = "views_count")
	@Builder.Default
	private Integer viewsCount = 0;

	@OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
	@Builder.Default
	private List<DonationImage> images = new ArrayList<>();

	@OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<NgoClaim> claims = new ArrayList<>();

}
