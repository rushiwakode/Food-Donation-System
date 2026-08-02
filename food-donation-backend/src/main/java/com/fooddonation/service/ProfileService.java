package com.fooddonation.service;

import org.springframework.data.domain.Pageable;

import com.fooddonation.dto.request.*;
import com.fooddonation.dto.response.*;
import com.fooddonation.enums.RequestStatus;

public interface ProfileService {

	/**
	 * Update non-sensitive fields instantly (name, address, city, state, pincode)
	 */
	UserResponse updateBasicProfile(String email, UpdateBasicProfileRequest request);

	/** Submit a request to change email or phone — goes to admin for approval */
	ProfileChangeRequestResponse submitContactChangeRequest(String email, ContactChangeRequest request);

	/** Get all change requests for the current user */
	PageResponse<ProfileChangeRequestResponse> getMyChangeRequests(String email, Pageable pageable);

	/**
	 * Send OTP to the new email/phone. Called ONLY when the user explicitly clicks
	 * "Send OTP" after admin approval. Status must be APPROVED or OTP_SENT (resend
	 * case).
	 */
	void sendOtpToUser(Long requestId, String userEmail);

	/** Verify OTP entered by user and apply the contact change */
	UserResponse verifyOtpAndApplyChange(String email, VerifyOtpRequest request);

	// ─── Admin ───────────────────────────────────────────────

	/** Admin — Get all change requests (optionally filtered by status) */
	PageResponse<ProfileChangeRequestResponse> getAllChangeRequests(RequestStatus status, Pageable pageable);

	/** Admin approves — status → APPROVED. OTP is NOT sent here. */
	ProfileChangeRequestResponse approveChangeRequest(Long requestId, String adminNote, String adminEmail);

	/** Admin rejects a request */
	ProfileChangeRequestResponse rejectChangeRequest(Long requestId, String adminNote, String adminEmail);
}
