package com.fooddonation.service.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fooddonation.dto.request.ClaimRequest;
import com.fooddonation.dto.response.ClaimResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.entity.DeliveryAssignment;
import com.fooddonation.entity.FoodDonation;
import com.fooddonation.entity.NgoClaim;
import com.fooddonation.entity.User;
import com.fooddonation.enums.AssignmentStatus;
import com.fooddonation.enums.ClaimStatus;
import com.fooddonation.enums.DonationStatus;
import com.fooddonation.enums.NotificationType;
import com.fooddonation.exception.BadRequestException;
import com.fooddonation.exception.ConflictException;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.exception.UnauthorizedException;
import com.fooddonation.repository.DeliveryAssignmentRepository;
import com.fooddonation.repository.FoodDonationRepository;
import com.fooddonation.repository.NgoClaimRepository;
import com.fooddonation.repository.UserRepository;
import com.fooddonation.service.NgoService;
import com.fooddonation.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NgoServiceImpl implements NgoService {

	private final NgoClaimRepository claimRepository;
	private final FoodDonationRepository donationRepository;
	private final UserRepository userRepository;
	private final DeliveryAssignmentRepository deliveryRepository;
	private final NotificationService notificationService;

	@Override
	@Transactional
	public ClaimResponse claimDonation(String ngoEmail, ClaimRequest request) {
		User ngo = getUserByEmail(ngoEmail);
		FoodDonation donation = donationRepository.findById(request.getDonationId())
				.orElseThrow(() -> new ResourceNotFoundException("Donation", request.getDonationId()));

		if (donation.getStatus() != DonationStatus.APPROVED) {
			throw new BadRequestException("This donation is not available for claiming");
		}
		if (claimRepository.existsByDonationIdAndNgoId(donation.getId(), ngo.getId())) {
			throw new ConflictException("You have already claimed this donation");
		}

		NgoClaim claim = NgoClaim.builder().donation(donation).ngo(ngo).claimMessage(request.getClaimMessage())
				.peopleCount(request.getPeopleCount()).status(ClaimStatus.PENDING).build();
		NgoClaim saved = claimRepository.save(claim);

		donation.setStatus(DonationStatus.CLAIMED);
		donationRepository.save(donation);

		notificationService.sendNotification(donation.getDonor(), "New Claim on Your Donation",
				ngo.getFullName() + " has claimed your donation: " + donation.getTitle(), NotificationType.CLAIM,
				saved.getId(), "CLAIM");

		log.info("NGO {} claimed donation {}", ngoEmail, donation.getId());
		return mapToResponse(saved);
	}

	@Override
	@Transactional
	public void cancelClaim(Long claimId, String ngoEmail) {
		NgoClaim claim = claimRepository.findById(claimId)
				.orElseThrow(() -> new ResourceNotFoundException("Claim", claimId));
		if (!claim.getNgo().getEmail().equals(ngoEmail)) {
			throw new UnauthorizedException("You can only cancel your own claims");
		}
		if (claim.getStatus() == ClaimStatus.COMPLETED) {
			throw new BadRequestException("Cannot cancel a completed claim");
		}
		claim.setStatus(ClaimStatus.CANCELLED);
		claimRepository.save(claim);

		FoodDonation donation = claim.getDonation();
		donation.setStatus(DonationStatus.APPROVED);
		donationRepository.save(donation);
	}

	@Override
	@Transactional(readOnly = true)
	public ClaimResponse getClaimById(Long claimId) {
		return mapToResponse(
				claimRepository.findById(claimId).orElseThrow(() -> new ResourceNotFoundException("Claim", claimId)));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<ClaimResponse> getMyClaims(String ngoEmail, ClaimStatus status, Pageable pageable) {
		User ngo = getUserByEmail(ngoEmail);
		Page<NgoClaim> page = status != null ? claimRepository.findByNgoIdAndStatus(ngo.getId(), status, pageable)
				: claimRepository.findByNgoId(ngo.getId(), pageable);
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<ClaimResponse> getAllClaims(ClaimStatus status, Pageable pageable) {
		Page<NgoClaim> page = (status != null) ? claimRepository.findByStatus(status, pageable)
				: claimRepository.findAll(pageable);
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional
	public ClaimResponse approveClaim(Long claimId, String adminEmail) {
		NgoClaim claim = claimRepository.findById(claimId)
				.orElseThrow(() -> new ResourceNotFoundException("Claim", claimId));
		claim.setStatus(ClaimStatus.APPROVED);
		claim.setApprovedAt(LocalDateTime.now());
		NgoClaim saved = claimRepository.save(claim);

		// Create delivery assignment
		DeliveryAssignment assignment = DeliveryAssignment.builder().claim(saved).donation(saved.getDonation())
				.status(AssignmentStatus.UNASSIGNED).build();
		deliveryRepository.save(assignment);

		notificationService.sendNotification(claim.getNgo(), "Claim Approved",
				"Your claim for '" + claim.getDonation().getTitle()
						+ "' has been approved. A delivery agent will be assigned soon.",
				NotificationType.CLAIM, claimId, "CLAIM");

		return mapToResponse(saved);
	}

	@Override
	@Transactional
	public ClaimResponse rejectClaim(Long claimId, String reason, String adminEmail) {
		NgoClaim claim = claimRepository.findById(claimId)
				.orElseThrow(() -> new ResourceNotFoundException("Claim", claimId));
		claim.setStatus(ClaimStatus.REJECTED);
		claim.setRejectReason(reason);
		claim.setRejectedAt(LocalDateTime.now());
		NgoClaim saved = claimRepository.save(claim);

		FoodDonation donation = claim.getDonation();
		donation.setStatus(DonationStatus.APPROVED);
		donationRepository.save(donation);

		notificationService.sendNotification(claim.getNgo(), "Claim Rejected",
				"Your claim for '" + claim.getDonation().getTitle() + "' was rejected. Reason: " + reason,
				NotificationType.ALERT, claimId, "CLAIM");

		return mapToResponse(saved);
	}

	private ClaimResponse mapToResponse(NgoClaim c) {
		DeliveryAssignment da = c.getDeliveryAssignment();
		com.fooddonation.dto.response.DeliveryResponse deliveryResponse = null;
		if (da != null) {
			deliveryResponse = com.fooddonation.dto.response.DeliveryResponse.builder().id(da.getId())
					.status(da.getStatus().name()).agentId(da.getAgent() != null ? da.getAgent().getId() : null)
					.agentName(da.getAgent() != null ? da.getAgent().getFullName() : null)
					.agentPhone(da.getAgent() != null ? da.getAgent().getPhone() : null).assignedAt(da.getAssignedAt())
					.pickedUpAt(da.getPickedUpAt()).deliveredAt(da.getDeliveredAt()).build();
		}
		return ClaimResponse.builder().id(c.getId()).donationId(c.getDonation().getId())
				.donationTitle(c.getDonation().getTitle()).donationCity(c.getDonation().getPickupCity())
				.ngoId(c.getNgo().getId()).ngoName(c.getNgo().getFullName()).claimMessage(c.getClaimMessage())
				.peopleCount(c.getPeopleCount()).status(c.getStatus().name()).claimedAt(c.getClaimedAt())
				.approvedAt(c.getApprovedAt()).completedAt(c.getCompletedAt()).delivery(deliveryResponse).build();
	}

	private User getUserByEmail(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
	}
}
