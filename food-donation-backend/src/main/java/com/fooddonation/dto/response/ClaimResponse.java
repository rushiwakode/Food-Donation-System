package com.fooddonation.dto.response;

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
public class ClaimResponse {

	private Long id;
	private Long donationId;
	private String donationTitle;
	private String donationCity;
	private Long ngoId;
	private String ngoName;
	private String claimMessage;
	private Integer peopleCount;
	private String status;
	private LocalDateTime claimedAt;
	private LocalDateTime approvedAt;
	private LocalDateTime completedAt;
	private DeliveryResponse delivery;

}
