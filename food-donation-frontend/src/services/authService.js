import apiClient from './apiClient';

const authService = {
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data;
  },
  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data;
  },
  async logout() {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },
  async forgotPassword(email) {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },
  async resetPassword(payload) {
    const { data } = await apiClient.post('/auth/reset-password', payload);
    return data;
  },
  async verifyEmail(token) {
    const { data } = await apiClient.get(`/auth/verify-email?token=${token}`);
    return data;
  },
};

export default authService;
