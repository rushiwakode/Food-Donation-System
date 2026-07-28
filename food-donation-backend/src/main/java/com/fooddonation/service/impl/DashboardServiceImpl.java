package com.fooddonation.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fooddonation.dto.response.DashboardStatsResponse;
import com.fooddonation.entity.Role;
import com.fooddonation.entity.User;
import com.fooddonation.enums.AssignmentStatus;
import com.fooddonation.enums.ClaimStatus;
import com.fooddonation.enums.DonationStatus;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.repository.DeliveryAssignmentRepository;
import com.fooddonation.repository.FoodDonationRepository;
import com.fooddonation.repository.NgoClaimRepository;
import com.fooddonation.repository.UserRepository;
import com.fooddonation.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

	private final UserRepository userRepository;
	private final FoodDonationRepository donationRepository;
	private final NgoClaimRepository claimRepository;
	private final DeliveryAssignmentRepository deliveryRepository;

	@Override
	@Transactional(readOnly = true)
	public DashboardStatsResponse getAdminDashboard() {
		int year = LocalDateTime.now().getYear();
		List<Object[]> monthly = donationRepository.getMonthlyStats(year);
		List<Map<String, Object>> monthlyData = new ArrayList<>();
		String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
		for (Object[] row : monthly) {
			Map<String, Object> m = new HashMap<>();
			m.put("month", months[((Number) row[0]).intValue() - 1]);
			m.put("count", row[1]);
			monthlyData.add(m);
		}

		List<Object[]> cityData = donationRepository.getDonationsByCity();
		List<Map<String, Object>> byCity = new ArrayList<>();
		for (Object[] row : cityData) {
			Map<String, Object> m = new HashMap<>();
			m.put("city", row[0]);
			m.put("count", row[1]);
			byCity.add(m);
		}

		List<Map<String, Object>> byStatus = List.of(
				Map.of("status", "PENDING", "count", donationRepository.countByStatus(DonationStatus.PENDING)),
				Map.of("status", "APPROVED", "count", donationRepository.countByStatus(DonationStatus.APPROVED)),
				Map.of("status", "CLAIMED", "count", donationRepository.countByStatus(DonationStatus.CLAIMED)),
				Map.of("status", "DELIVERED", "count", donationRepository.countByStatus(DonationStatus.DELIVERED)),
				Map.of("status", "EXPIRED", "count", donationRepository.countByStatus(DonationStatus.EXPIRED)));

		return DashboardStatsResponse.builder().totalUsers(userRepository.count())
				.totalDonors(userRepository.countByRole(Role.DONOR)).totalNgos(userRepository.countByRole(Role.NGO))
				.totalAgents(userRepository.countByRole(Role.DELIVERY_AGENT)).totalDonations(donationRepository.count())
				.pendingDonations(donationRepository.countByStatus(DonationStatus.PENDING))
				.approvedDonations(donationRepository.countByStatus(DonationStatus.APPROVED))
				.completedDonations(donationRepository.countByStatus(DonationStatus.DELIVERED))
				.expiredDonations(donationRepository.countByStatus(DonationStatus.EXPIRED))
				.totalDeliveries(deliveryRepository.count())
				.completedDeliveries(deliveryRepository.countByStatus(AssignmentStatus.DELIVERED))
				.pendingClaims(claimRepository.countByStatus(ClaimStatus.PENDING)).monthlyDonations(monthlyData)
				.donationsByCity(byCity).donationsByStatus(byStatus).build();
	}

	@Override
	@Transactional(readOnly = true)
	public DashboardStatsResponse getDonorDashboard(String donorEmail) {
		User donor = userRepository.findByEmail(donorEmail)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + donorEmail));
		return DashboardStatsResponse.builder().myDonations(donationRepository.countByDonorId(donor.getId()))
				.pendingDonations(donationRepository.countByStatus(DonationStatus.PENDING))
				.activeDonations(donationRepository.countByStatus(DonationStatus.APPROVED))
				.claimedDonations(donationRepository.countByStatus(DonationStatus.CLAIMED))
				.completedDonations(donationRepository.countByStatus(DonationStatus.DELIVERED)).build();
	}

	@Override
	@Transactional(readOnly = true)
	public DashboardStatsResponse getNgoDashboard(String ngoEmail) {
		User ngo = userRepository.findByEmail(ngoEmail)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + ngoEmail));
		return DashboardStatsResponse.builder().myClaims(claimRepository.countByNgoId(ngo.getId()))
				.pendingClaims(claimRepository.countByStatus(ClaimStatus.PENDING))
				.activeClaims(claimRepository.countByStatus(ClaimStatus.APPROVED))
				.approvedDonations(donationRepository.countByStatus(DonationStatus.APPROVED)).build();
	}

	@Override
	@Transactional(readOnly = true)
	public DashboardStatsResponse getAgentDashboard(String agentEmail) {
		User agent = userRepository.findByEmail(agentEmail)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + agentEmail));
		return DashboardStatsResponse.builder().myDeliveries(deliveryRepository.countByAgentId(agent.getId()))
				.completedDeliveries(
						deliveryRepository.countByAgentIdAndStatus(agent.getId(), AssignmentStatus.DELIVERED))
				.build();
	}
}
