package com.fooddonation.dto.response;

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
public class AuthResponse {

	private String accessToken;
	private String refreshToken;
	private String tokenType = "Bearer";
	private Long userId;
	private String email;
	private String fullName;
	private String profileImage;
	private List<String> roles;
	private String status;

}
