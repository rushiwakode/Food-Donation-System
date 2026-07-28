import apiClient from './apiClient';

const adminService = {
  async getDashboard() {
    const { data } = await apiClient.get('/admin/dashboard');
    return data.data;
  },
  async getAllUsers(params = {}) {
    const { data } = await apiClient.get('/admin/users', { params });
    return data.data;
  },
  async updateUserStatus(id, status) {
    const { data } = await apiClient.put(`/admin/users/${id}/status`, { status });
    return data;
  },
  async approveNgo(id) {
    const { data } = await apiClient.put(`/admin/users/${id}/approve-ngo`);
    return data.data;
  },
  async approveDonor(id) {
    const { data } = await apiClient.put(`/admin/users/${id}/approve-donor`);
    return data.data;
  },
  async deleteUser(id) {
    const { data } = await apiClient.delete(`/admin/users/${id}`);
    return data;
  },
  async getAllDonations(params = {}) {
    const { data } = await apiClient.get('/admin/donations', { params });
    return data.data;
  },
  async approveDonation(id) {
    const { data } = await apiClient.put(`/admin/donations/${id}/approve`);
    return data.data;
  },
  async rejectDonation(id, reason) {
    const { data } = await apiClient.put(`/admin/donations/${id}/reject`, { reason });
    return data.data;
  },
  async getAllClaims(params = {}) {
    const { data } = await apiClient.get('/admin/claims', { params });
    return data.data;
  },
  async approveClaim(id) {
    const { data } = await apiClient.put(`/admin/claims/${id}/approve`);
    return data.data;
  },
  async rejectClaim(id, reason) {
    const { data } = await apiClient.put(`/admin/claims/${id}/reject`, { reason });
    return data.data;
  },
  async getAllDeliveries(params = {}) {
    const { data } = await apiClient.get('/admin/deliveries', { params });
    return data.data;
  },
  async assignAgent(claimId, agentId) {
    const { data } = await apiClient.post(`/admin/deliveries/claims/${claimId}/assign`, { agentId });
    return data.data;
  },
};

export default adminService;
