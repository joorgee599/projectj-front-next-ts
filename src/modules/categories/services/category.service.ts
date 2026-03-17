import { apiClient } from '@/core/api/client';
import { Category, CategoryRequest, CategoryResponse } from '../types/category.types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<CategoryResponse>('/v1/categories');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<CategoryResponse>(`/v1/categories/${id}`);
    return response.data as Category;
  },

  async create(category: CategoryRequest): Promise<Category> {
    const response = await apiClient.post<CategoryResponse>('/v1/categories', category);
    return response.data as Category;
  },

  async update(id: number, category: CategoryRequest): Promise<Category> {
    const response = await apiClient.request<CategoryResponse>(`/v1/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
    return response.data as Category;
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<CategoryResponse>(`/v1/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async updateStatus(id: number, currentStatus: number): Promise<Category> {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const response = await apiClient.request<CategoryResponse>(
      `/v1/categories/${id}/status?status=${newStatus}`,
      { method: 'PATCH' }
    );
    return response.data as Category;
  },
};
