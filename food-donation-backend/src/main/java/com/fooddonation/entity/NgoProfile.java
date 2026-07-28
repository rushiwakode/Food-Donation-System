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
@Table(name = "ngo_profiles", uniqueConstraints = @UniqueConstraint(name = "uk_ngo_user", columnNames = "user_id"))
public class NgoProfile extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(name = "organization_name", nullable = false, length = 200)
	private String organizationName;

	@Column(name = "registration_number", length = 100)
	private String registrationNumber;

	@Column(name = "registration_doc", length = 500)
	private String registrationDoc;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(length = 300)
	private String website;

	@Column(name = "operating_since")
	private Integer operatingSince;

	@Column(name = "food_capacity")
	private Integer foodCapacity;

	@Column(name = "service_area", length = 500)
	private String serviceArea;

	@Column(nullable = false)
	@Builder.Default
	private Boolean verified = false;

	@Column(name = "verified_at")
	private LocalDateTime verifiedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "verified_by")
	private User verifiedBy;
}
