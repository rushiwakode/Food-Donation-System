import apiClient from './apiClient';

const deliveryService = {
  async getDelivery(id) {
    const { data } = await apiClient.get(`/delivery/${id}`);
    return data.data;
  },
  async updateStatus(id, status, notes) {
    const { data } = await apiClient.put(`/delivery/${id}/status`, { status, notes });
    return data.data;
  },
  async confirmPickup(id, otp) {
    const { data } = await apiClient.post(`/delivery/${id}/confirm-pickup`, { otp });
    return data.data;
  },
  async confirmDelivery(id, otp) {
    const { data } = await apiClient.post(`/delivery/${id}/confirm-delivery`, { otp });
    return data.data;
  },
  async getMyDeliveries(params = {}) {
    const { data } = await apiClient.get('/delivery/my-deliveries', { params });
    return data.data;
  },
};

export default deliveryService;
