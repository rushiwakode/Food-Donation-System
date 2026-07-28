package com.fooddonation.entity;

import java.math.BigDecimal;

import com.fooddonation.enums.DonorType;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "donor_profiles", uniqueConstraints = @UniqueConstraint(name = "uk_donor_user", columnNames = "user_id"))
public class DonorProfile extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "donor_type", nullable = false, length = 30)
	@Builder.Default
	private DonorType donorType = DonorType.INDIVIDUAL;

	@Column(name = "organization", length = 200)
	private String organization;

	@Column(name = "fssai_number", length = 50)
	private String fssaiNumber;

	@Column(name = "total_donated")
	@Builder.Default
	private Integer totalDonated = 0;

	@Column(precision = 3, scale = 2)
	@Builder.Default
	private BigDecimal rating = BigDecimal.ZERO;

}
