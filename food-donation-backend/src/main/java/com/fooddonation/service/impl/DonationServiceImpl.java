package com.fooddonation.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fooddonation.dto.request.CreateDonationRequest;
import com.fooddonation.dto.response.DonationResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.entity.DonationImage;
import com.fooddonation.entity.FoodCategory;
import com.fooddonation.entity.FoodDonation;
import com.fooddonation.entity.User;
import com.fooddonation.enums.DonationStatus;
import com.fooddonation.enums.FoodType;
import com.fooddonation.enums.NotificationType;
import com.fooddonation.enums.QuantityUnit;
import com.fooddonation.exception.BadRequestException;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.exception.UnauthorizedException;
import com.fooddonation.repository.DonationImageRepository;
import com.fooddonation.repository.FoodCategoryRepository;
import com.fooddonation.repository.FoodDonationRepository;
import com.fooddonation.repository.UserRepository;
import com.fooddonation.service.DonationService;
import com.fooddonation.service.NotificationService;
import com.fooddonation.util.FileUploadUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonationServiceImpl implements DonationService {

	private final FoodDonationRepository donationRepository;
	private final UserRepository userRepository;
	private final FoodCategoryRepository categoryRepository;
	private final DonationImageRepository donationImageRepository;
	private final NotificationService notificationService;
	private final FileUploadUtil fileUploadUtil;

	@Override
	@Transactional
	public DonationResponse createDonation(String donorEmail, CreateDonationRequest request) {
		User donor = getUserByEmail(donorEmail);
		FoodCategory category = categoryRepository.findById(request.getCategoryId())
				.orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

		FoodDonation donation = FoodDonation.builder().donor(donor).category(category).title(request.getTitle())
				.description(request.getDescription()).foodType(request.getFoodType()).quantity(request.getQuantity())
				.quantityUnit(request.getQuantityUnit() != null ? request.getQuantityUnit() : QuantityUnit.SERVINGS)
				.preparedAt(request.getPreparedAt()).expiresAt(request.getExpiresAt())
				.pickupAddress(request.getPickupAddress()).pickupCity(request.getPickupCity())
				.pickupState(request.getPickupState()).pickupPincode(request.getPickupPincode())
				.pickupLatitude(
						request.getPickupLatitude() != null ? BigDecimal.valueOf(request.getPickupLatitude()) : null)
				.pickupLongitude(
						request.getPickupLongitude() != null ? BigDecimal.valueOf(request.getPickupLongitude()) : null)
				.pickupInstructions(request.getPickupInstructions())
				.isPerishable(request.getIsPerishable() != null ? request.getIsPerishable() : true)
				.allergenInfo(request.getAllergenInfo()).specialNotes(request.getSpecialNotes())
				.status(DonationStatus.PENDING).build();

		FoodDonation saved = donationRepository.save(donation);
		log.info("Donation created: id={} by donor={}", saved.getId(), donorEmail);

		return mapToResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public DonationResponse getDonationById(Long id) {
		FoodDonation donation = donationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Donation", id));
		donation.setViewsCount(donation.getViewsCount() + 1);
		donationRepository.save(donation);
		return mapToResponse(donation);
	}

	@Override
	@Transactional
	public DonationResponse updateDonation(Long id, String donorEmail, CreateDonationRequest request) {
		FoodDonation donation = donationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Donation", id));

		if (!donation.getDonor().getEmail().equals(donorEmail)) {
			throw new UnauthorizedException("You can only update your own donations");
		}

		if (donation.getStatus() != DonationStatus.PENDING) {
			throw new BadRequestException("Cannot update a donation that is already " + donation.getStatus());
		}

		FoodCategory category = categoryRepository.findById(request.getCategoryId())
				.orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

		donation.setTitle(request.getTitle());
		donation.setDescription(request.getDescription());
		donation.setFoodType(request.getFoodType());
		donation.setQuantity(request.getQuantity());
		donation.setCategory(category);
		donation.setExpiresAt(request.getExpiresAt());
		donation.setPickupAddress(request.getPickupAddress());
		donation.setPickupCity(request.getPickupCity());
		donation.setPickupInstructions(request.getPickupInstructions());
		donation.setSpecialNotes(request.getSpecialNotes());

		return mapToResponse(donationRepository.save(donation));
	}

	@Override
	@Transactional
	public void deleteDonation(Long id, String donorEmail) {
		FoodDonation donation = donationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Donation", id));

		if (!donation.getDonor().getEmail().equals(donorEmail)) {
			throw new UnauthorizedException("You can only delete your own donations");
		}

		if (donation.getStatus() == DonationStatus.CLAIMED || donation.getStatus() == DonationStatus.PICKED_UP) {
			throw new BadRequestException("Cannot delete a donation that is already claimed or in delivery");
		}

		donationRepository.delete(donation);
		log.info("Donation deleted: id={}", id);
	}

	@Override
	@Transactional
	public void addImages(Long donationId, String donorEmail, List<MultipartFile> files) {
		FoodDonation donation = donationRepository.findById(donationId)
				.orElseThrow(() -> new ResourceNotFoundException("Donation", donationId));

		if (!donation.getDonor().getEmail().equals(donorEmail)) {
			throw new UnauthorizedException("You can only add images to your own donations");
		}

		if (files.size() > 5) {
			throw new BadRequestException("Maximum 5 images allowed per donation");
		}

		boolean hasPrimary = donation.getImages().stream().anyMatch(DonationImage::getIsPrimary);

		for (int i = 0; i < files.size(); i++) {
			MultipartFile file = files.get(i);
			String imageUrl = fileUploadUtil.uploadFile(file, "donations/" + donationId);

			DonationImage image = DonationImage.builder().donation(donation).imageUrl(imageUrl)
					.imageName(file.getOriginalFilename()).isPrimary(!hasPrimary && i == 0)
					.sortOrder(donation.getImages().size() + i).build();

			donationImageRepository.save(image);
			if (i == 0 && !hasPrimary)
				hasPrimary = true;
		}
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<DonationResponse> getDonationsByDonor(String donorEmail, DonationStatus status,
			Pageable pageable) {
		User donor = getUserByEmail(donorEmail);
		Page<FoodDonation> page;
		if (status != null) {
			page = donationRepository.findByDonorIdAndStatus(donor.getId(), status, pageable);
		} else {
			page = donationRepository.findByDonorId(donor.getId(), pageable);
		}
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<DonationResponse> searchDonations(String query, String city, Long categoryId, String foodType,
			Pageable pageable) {
		List<DonationStatus> statuses = List.of(DonationStatus.APPROVED);
		FoodType ft = foodType != null ? FoodType.valueOf(foodType.toUpperCase()) : null;
		Page<FoodDonation> page = donationRepository.searchDonations(statuses, query != null ? query : "", city,
				categoryId, ft, pageable);
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional
	public DonationResponse approveDonation(Long id, String adminEmail) {
		FoodDonation donation = donationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Donation", id));
		donation.setStatus(DonationStatus.APPROVED);
		FoodDonation saved = donationRepository.save(donation);

		notificationService.sendNotification(donation.getDonor(), "Donation Approved",
				"Your donation '" + donation.getTitle() + "' has been approved and is now visible to NGOs.",
				NotificationType.DONATION, donation.getId(), "DONATION");

		return mapToResponse(saved);
	}

	@Override
	@Transactional
	public DonationResponse rejectDonation(Long id, String reason, String adminEmail) {
		FoodDonation donation = donationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Donation", id));
		donation.setStatus(DonationStatus.REJECTED);
		donation.setRejectedReason(reason);
		FoodDonation saved = donationRepository.save(donation);

		notificationService.sendNotification(donation.getDonor(), "Donation Rejected",
				"Your donation '" + donation.getTitle() + "' was rejected. Reason: " + reason, NotificationType.ALERT,
				donation.getId(), "DONATION");

		return mapToResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<DonationResponse> getAllDonations(DonationStatus status, Pageable pageable) {
		Page<FoodDonation> page = (status != null) ? donationRepository.findByStatus(status, pageable)
				: donationRepository.findAll(pageable);
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Scheduled(cron = "0 0 * * * *") // Run every hour
	@Transactional
	public void expireOldDonations() {
		List<FoodDonation> expired = donationRepository.findExpiredDonations(LocalDateTime.now());
		expired.forEach(d -> d.setStatus(DonationStatus.EXPIRED));
		donationRepository.saveAll(expired);
		if (!expired.isEmpty()) {
			log.info("Expired {} donations", expired.size());
		}
	}

	// ===== Mapper =====

	private DonationResponse mapToResponse(FoodDonation d) {
		List<String> imageUrls = d.getImages().stream().sorted((a, b) -> a.getSortOrder() - b.getSortOrder())
				.map(DonationImage::getImageUrl).collect(Collectors.toList());

		String primaryUrl = d.getImages().stream().filter(DonationImage::getIsPrimary).map(DonationImage::getImageUrl)
				.findFirst().orElse(imageUrls.isEmpty() ? null : imageUrls.get(0));

		return DonationResponse.builder().id(d.getId()).donorId(d.getDonor().getId())
				.donorName(d.getDonor().getFullName())
				.categoryId(d.getCategory() != null ? d.getCategory().getId() : null)
				.categoryName(d.getCategory() != null ? d.getCategory().getName() : null).title(d.getTitle())
				.description(d.getDescription()).foodType(d.getFoodType().name()).quantity(d.getQuantity())
				.quantityUnit(d.getQuantityUnit().name()).preparedAt(d.getPreparedAt()).expiresAt(d.getExpiresAt())
				.pickupAddress(d.getPickupAddress()).pickupCity(d.getPickupCity()).pickupState(d.getPickupState())
				.pickupPincode(d.getPickupPincode()).pickupLatitude(d.getPickupLatitude())
				.pickupLongitude(d.getPickupLongitude()).pickupInstructions(d.getPickupInstructions())
				.status(d.getStatus().name()).isPerishable(d.getIsPerishable()).allergenInfo(d.getAllergenInfo())
				.specialNotes(d.getSpecialNotes()).viewsCount(d.getViewsCount()).imageUrls(imageUrls)
				.primaryImageUrl(primaryUrl).createdAt(d.getCreatedAt()).updatedAt(d.getUpdatedAt()).build();
	}

	private User getUserByEmail(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
	}
}
