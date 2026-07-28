package com.fooddonation.service;

import com.fooddonation.dto.response.DashboardStatsResponse;

public interface DashboardService {

	DashboardStatsResponse getAdminDashboard();

	DashboardStatsResponse getDonorDashboard(String donorEmail);

	DashboardStatsResponse getNgoDashboard(String ngoEmail);

	DashboardStatsResponse getAgentDashboard(String agentEmail);

}
