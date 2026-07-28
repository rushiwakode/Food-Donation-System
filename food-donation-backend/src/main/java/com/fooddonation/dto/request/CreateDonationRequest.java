package com.fooddonation.dto.request;

import java.time.LocalDateTime;

import com.fooddonation.enums.FoodType;
import com.fooddonation.enums.QuantityUnit;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateDonationRequest {

	@NotBlank(message = "Title is required")
	@Size(max = 200, message = "Title must not exceed 200 characters")
	private String title;

	@Size(max = 2000)
	private String description;

	@NotNull(message = "Food type is required")
	private FoodType foodType;

	@NotNull(message = "Quantity is required")
	@Min(value = 1, message = "Quantity must be at least 1")
	@Max(value = 10000, message = "Quantity must not exceed 10000")
	private Integer quantity;

	private QuantityUnit quantityUnit;

	@NotNull(message = "Category ID is required")
	private Long categoryId;

	@NotNull(message = "Prepared time is required")
	private LocalDateTime preparedAt;

	@NotNull(message = "Expiry time is required")
	@Future(message = "Expiry time must be in thhe future")
	private LocalDateTime expiresAt;

	@NotBlank(message = "Pickup address is required")
	private String pickupAddress;

	@NotBlank(message = "Pickup city is required")
	private String pickupCity;

	private String pickupState;
	private String pickupPincode;
	private Double pickupLatitude;
	private Double pickupLongitude;
	private String pickupInstructions;
	private Boolean isPerishable;
	private String allergenInfo;
	private String specialNotes;

}
