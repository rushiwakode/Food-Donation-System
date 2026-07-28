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
public class DonationResponse {

	private Long id;
	private Long donorId;
	private String donorName;
	private String donorOrganization;
	private Long categoryId;
	private String categoryName;
	private String title;
	private String description;
	private String foodType;
	private Integer quantity;
	private String quantityUnit;
	private LocalDateTime preparedAt;
	private LocalDateTime expiresAt;
	private String pickupAddress;
	private String pickupCity;
	private String pickupState;
	private String pickupPincode;
	private BigDecimal pickupLatitude;
	private BigDecimal pickupLongitude;
	private String pickupInstructions;
	private String status;
	private Boolean isPerishable;
	private String allergenInfo;
	private String specialNotes;
	private Integer viewsCount;
	private List<String> imageUrls;
	private String primaryImageUrl;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Long activeClaimId;
	private String activeClaimStatus;

}
