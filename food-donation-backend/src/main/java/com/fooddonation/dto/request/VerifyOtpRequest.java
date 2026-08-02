package com.fooddonation.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
public class VerifyOtpRequest {

	@NotNull(message = "Request ID is required")
	private Long requestId;

	@NotBlank(message = "OTP is required")
	@Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
	private String otp;

}
