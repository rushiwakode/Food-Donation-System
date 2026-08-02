import apiClient from './apiClient';

const profileService = {

  // ─── Basic Profile (instant) ──────────────────────────────
  updateBasicProfile: async (payload) => {
    const { data } = await apiClient.put('/profile/basic', payload);
    return data.data;
  },

  // ─── Submit change request ────────────────────────────────
  submitContactChangeRequest: async (payload) => {
    const { data } = await apiClient.post('/profile/change-request', payload);
    return data.data;
  },

  getMyChangeRequests: async (params = {}) => {
    const { data } = await apiClient.get('/profile/change-requests/my', { params });
    return data.data;
  },

  /**
   * User clicks "Send OTP" button — only works if request is APPROVED.
   * OTP is NOT sent automatically on admin approval.
   */
  sendOtp: async (requestId) => {
    const { data } = await apiClient.post(`/profile/change-requests/${requestId}/send-otp`);
    return data;
  },

  verifyOtp: async (payload) => {
    const { data } = await apiClient.post('/profile/verify-otp', payload);
    return data.data;
  },

  // ─── Admin ────────────────────────────────────────────────
  getAllChangeRequests: async (params = {}) => {
    const { data } = await apiClient.get('/profile/admin/change-requests', { params });
    return data.data;
  },

  approveChangeRequest: async (id, adminNote) => {
    const { data } = await apiClient.put(
      `/profile/admin/change-requests/${id}/approve`,
      { adminNote }
    );
    return data.data;
  },

  rejectChangeRequest: async (id, adminNote) => {
    const { data } = await apiClient.put(
      `/profile/admin/change-requests/${id}/reject`,
      { adminNote }
    );
    return data.data;
  },
};

export default profileService;