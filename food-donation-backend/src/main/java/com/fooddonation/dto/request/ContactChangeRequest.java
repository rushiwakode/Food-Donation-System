package com.fooddonation.dto.request;

import com.fooddonation.enums.FieldType;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
public class ContactChangeRequest {

	@NotNull(message = "Field type is required (EMAIL or PHONE)")
	private FieldType fieldType;

	@NotBlank(message = "New value is required")
	@Size(max = 200, message = "Value too long")
	private String newValue;

	@NotBlank(message = "Reason is required")
	@Size(min = 10, max = 1000, message = "Reason must be 10-1000 characters")
	private String reason;

}
