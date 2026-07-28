import apiClient from './apiClient';

const donationService = {
  async createDonation(payload) {
    const { data } = await apiClient.post('/donations', payload);
    return data.data;
  },
  async getDonation(id) {
    const { data } = await apiClient.get(`/donations/${id}`);
    return data.data;
  },
  async updateDonation(id, payload) {
    const { data } = await apiClient.put(`/donations/${id}`, payload);
    return data.data;
  },
  async deleteDonation(id) {
    const { data } = await apiClient.delete(`/donations/${id}`);
    return data;
  },
  async uploadImages(id, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await apiClient.post(`/donations/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async getMyDonations(params = {}) {
    const { data } = await apiClient.get('/donations/my-donations', { params });
    return data.data;
  },
  async searchDonations(params = {}) {
    const { data } = await apiClient.get('/donations/search', { params });
    return data.data;
  },
};

export default donationService;
