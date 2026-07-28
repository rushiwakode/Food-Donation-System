import apiClient from './apiClient';

const userService = {
  async getCurrentUser() {
    const { data } = await apiClient.get('/users/me');
    return data.data;
  },
  async getUserById(id) {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data;
  },
  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  async changePassword(oldPassword, newPassword) {
    const { data } = await apiClient.put('/users/me/change-password', { oldPassword, newPassword });
    return data;
  },
};

export default userService;
