package com.fooddonation.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileChangeRequestResponse {
	
	private Long id;
	private Long userId;
	private String userFullName;
	private String userEmail;
	private String fieldType;
	private String currentValue;
	private String requestedValue;
	private String reason;
	private String status;
	private String adminNote;
	private String reviewedBy;
	private LocalDateTime reviewedAt;
	private LocalDateTime otpSentAt;
	private Boolean otpVerified;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
