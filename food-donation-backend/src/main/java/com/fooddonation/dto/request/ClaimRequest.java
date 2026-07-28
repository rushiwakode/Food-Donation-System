package com.fooddonation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimRequest {

	@NotNull
	private Long donationId;

	@Size(max = 1000)
	private String claimMessage;

	@Min(1)
	@Max(10000)
	private Integer peopleCount;

}
