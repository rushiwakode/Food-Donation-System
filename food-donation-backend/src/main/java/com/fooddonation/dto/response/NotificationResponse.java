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
public class NotificationResponse {

	private Long id;
	private String title;
	private String message;
	private String type;
	private Boolean isRead;
	private String actionUrl;
	private Long referenceId;
	private String referenceType;
	private LocalDateTime createdAt;

}
