import apiClient from './apiClient';

const notificationService = {
  async getMyNotifications(params = {}) {
    const { data } = await apiClient.get('/notifications', { params });
    return data.data;
  },
  async getUnreadCount() {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data.data.unreadCount;
  },
  async markAsRead(id) {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data;
  },
  async markAllAsRead() {
    const { data } = await apiClient.put('/notifications/read-all');
    return data;
  },
};

export default notificationService;
