package com.fooddonation.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.fooddonation.dto.request.CreateDonationRequest;
import com.fooddonation.dto.response.DonationResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.enums.DonationStatus;

public interface DonationService {

	DonationResponse createDonation(String donorEmail, CreateDonationRequest request);

	DonationResponse getDonationById(Long id);

	DonationResponse updateDonation(Long id, String donorEmail, CreateDonationRequest request);

	void deleteDonation(Long id, String donorEmail);

	void addImages(Long donationId, String donorEmail, List<MultipartFile> files);

	PageResponse<DonationResponse> getDonationsByDonor(String donorEmail, DonationStatus status, Pageable pageable);

	PageResponse<DonationResponse> searchDonations(String query, String city, Long categoryId, String foodType,
			Pageable pageable);

	DonationResponse approveDonation(Long id, String adminEmail);

	DonationResponse rejectDonation(Long id, String reason, String adminEmail);

	PageResponse<DonationResponse> getAllDonations(DonationStatus status, Pageable pageable);

	void expireOldDonations();

}
