package com.fooddonation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
public class UpdateBasicProfileRequest {

	@Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
	private String fullName;

	@Size(max = 500, message = "Address too long")
	private String address;

	@Size(max = 100)
	private String city;

	@Size(max = 100)
	private String state;

	@Size(max = 10)
	private String pincode;

}
