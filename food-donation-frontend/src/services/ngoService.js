import apiClient from './apiClient';

const ngoService = {
  async claimDonation(payload) {
    const { data } = await apiClient.post('/ngo/claims', payload);
    return data.data;
  },
  async cancelClaim(id) {
    const { data } = await apiClient.delete(`/ngo/claims/${id}`);
    return data;
  },
  async getClaim(id) {
    const { data } = await apiClient.get(`/ngo/claims/${id}`);
    return data.data;
  },
  async getMyClaims(params = {}) {
    const { data } = await apiClient.get('/ngo/claims/my-claims', { params });
    return data.data;
  },
};

export default ngoService;
