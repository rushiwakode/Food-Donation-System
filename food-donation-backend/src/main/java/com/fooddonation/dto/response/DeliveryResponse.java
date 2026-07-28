package com.fooddonation.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class DeliveryResponse {

	private Long id;
	private Long claimId;
	private Long donationId;
	private String donationTitle;
	private String pickupAddress;
	private String pickupCity;
	private Long agentId;
	private String agentName;
	private String agentPhone;
	private String status;
	private LocalDateTime assignedAt;
	private LocalDateTime pickedUpAt;
	private LocalDateTime deliveredAt;
	private BigDecimal distanceKm;

}
