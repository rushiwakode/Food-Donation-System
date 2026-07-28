package com.fooddonation.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

	private Long id;
	private String fullName;
	private String email;
	private String phone;
	private String profileImage;
	private String address;
	private String city;
	private String state;
	private String pincode;
	private BigDecimal latitude;
	private BigDecimal longitude;
	private String status;
	private Boolean emailVerified;
	private List<String> roles;
	private LocalDateTime lastLogin;
	private LocalDateTime createdAt;

	// Profile-specific fields
	private String donorType;
	private String organization;
	private String organizationName;
	private Boolean ngoVerified;
	private String vehicleType;
	private Integer totalDonated;
	private Integer totalDeliveries;
	private BigDecimal rating;

}
