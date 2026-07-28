package com.fooddonation.dto.response;

import java.util.List;
import java.util.Map;

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
public class DashboardStatsResponse {

	// Admin stats
	private Long totalUsers;
	private Long totalDonors;
	private Long totalNgos;
	private Long totalAgents;
	private Long totalDonations;
	private Long pendingDonations;
	private Long approvedDonations;
	private Long completedDonations;
	private Long expiredDonations;
	private Long totalDeliveries;
	private Long completedDeliveries;
	private Long pendingClaims;

	// Donor Stats
	private Long myDonations;
	private Long activeDonations;
	private Long claimedDonations;

	// NGO Stats
	private Long myClaims;
	private Long activeClaims;

	// Agent stats
	private Long myDeliveries;
	private Long todayDeliveries;

	// Chart data
	private List<Map<String, Object>> monthlyDonations;
	private List<Map<String, Object>> donationsByCity;
	private List<Map<String, Object>> donationsByStatus;
	private List<Map<String, Object>> recentActivity;

}
