package com.fooddonation.service;

import org.springframework.data.domain.Pageable;

import com.fooddonation.dto.request.ClaimRequest;
import com.fooddonation.dto.response.ClaimResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.enums.ClaimStatus;

public interface NgoService {

	ClaimResponse claimDonation(String ngoEmail, ClaimRequest request);

	void cancelClaim(Long claimId, String ngoEmail);

	ClaimResponse getClaimById(Long claimId);

	PageResponse<ClaimResponse> getMyClaims(String ngoEmail, ClaimStatus status, Pageable pageable);

	PageResponse<ClaimResponse> getAllClaims(ClaimStatus status, Pageable pageable);

	ClaimResponse approveClaim(Long claimId, String adminEmail);

	ClaimResponse rejectClaim(Long claimId, String reason, String adminEmail);

}
