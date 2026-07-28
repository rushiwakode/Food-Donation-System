package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

import com.fooddonation.enums.VehicleType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "delivery_agent_profiles", uniqueConstraints = @UniqueConstraint(name = "uk_agent_user", columnNames = "user_id"))
public class DeliveryAgentProfile extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "vehicle_type", length = 10)
	@Builder.Default
	private VehicleType vehicleType = VehicleType.BIKE;

	@Column(name = "vehicle_number", length = 20)
	private String vehicleNumber;

	@Column(name = "license_number", length = 50)
	private String licenseNumber;

	@Column(name = "is_available")
	@Builder.Default
	private Boolean isAvailable = true;

	@Column(name = "total_deliveries")
	@Builder.Default
	private Integer totalDeliveries = 0;

	@Column(precision = 3, scale = 2)
	@Builder.Default
	private BigDecimal rating = BigDecimal.ZERO;

}
