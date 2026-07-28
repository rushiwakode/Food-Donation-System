import apiClient from './apiClient';

const categoryService = {
  async getAllCategories() {
    const { data } = await apiClient.get('/categories');
    return data.data;
  },
};

export default categoryService;
