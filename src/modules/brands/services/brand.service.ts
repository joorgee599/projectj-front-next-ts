import { apiClient } from '@/core/api/client';
import { Brand, BrandRequest, BrandResponse } from '../types/brand.types';

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const response = await apiClient.get<BrandResponse>('/v1/brands');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: number): Promise<Brand> {
    const response = await apiClient.get<BrandResponse>(`/v1/brands/${id}`);
    return response.data as Brand;
  },

  async create(brand: BrandRequest): Promise<Brand> {
    const response = await apiClient.post<BrandResponse>('/v1/brands', brand);
    return response.data as Brand;
  },

  async update(id: number, brand: BrandRequest): Promise<Brand> {
    const response = await apiClient.request<BrandResponse>(`/v1/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brand),
    });
    return response.data as Brand;
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<BrandResponse>(`/v1/brands/${id}`, {
      method: 'DELETE',
    });
  },

  async updateStatus(id: number, currentStatus: number): Promise<Brand> {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const response = await apiClient.request<BrandResponse>(
      `/v1/brands/${id}/status?status=${newStatus}`,
      { method: 'PATCH' }
    );
    return response.data as Brand;
  },
};
