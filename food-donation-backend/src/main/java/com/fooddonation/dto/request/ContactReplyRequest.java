package com.fooddonation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactReplyRequest {

	@NotBlank
	private String replyNote;

}
