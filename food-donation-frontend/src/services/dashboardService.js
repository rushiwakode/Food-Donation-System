import apiClient from './apiClient';

const dashboardService = {
  async getDonorDashboard() {
    const { data } = await apiClient.get('/dashboard/donor');
    return data.data;
  },
  async getNgoDashboard() {
    const { data } = await apiClient.get('/dashboard/ngo');
    return data.data;
  },
  async getAgentDashboard() {
    const { data } = await apiClient.get('/dashboard/agent');
    return data.data;
  },
};

export default dashboardService;
