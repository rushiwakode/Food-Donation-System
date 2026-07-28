package com.fooddonation.service;

import org.springframework.data.domain.Pageable;

import com.fooddonation.dto.response.DeliveryResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.enums.AssignmentStatus;

public interface DeliveryService {

	DeliveryResponse assignAgent(Long claimId, Long agentId, String adminEmail);

	DeliveryResponse updateStatus(Long assignmentId, String agentEmail, AssignmentStatus status, String notes);

	DeliveryResponse confirmPickup(Long assignmentId, String agentEmail, String otp);

	DeliveryResponse confirmDelivery(Long assignmentId, String agentEmail, String otp);

	PageResponse<DeliveryResponse> getMyDeliveries(String agentEmail, AssignmentStatus status, Pageable pageable);

	PageResponse<DeliveryResponse> getAllDeliveries(AssignmentStatus status, Pageable pageable);

	DeliveryResponse getById(Long id);

}
