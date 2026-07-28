import apiClient from './apiClient';

const contactService = {
  async submitMessage(payload) {
    const { data } = await apiClient.post('/public/contact', payload);
    return data;
  },
};

export default contactService;
