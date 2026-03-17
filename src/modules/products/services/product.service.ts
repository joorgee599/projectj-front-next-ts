import { apiClient } from '@/core/api/client';
import { Product, ProductRequest, ProductResponse } from '../types/product.types';

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<ProductResponse>('/v1/products');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<ProductResponse>(`/v1/products/${id}`);
    return response.data as Product;
  },

  async create(product: ProductRequest): Promise<Product> {
    const response = await apiClient.post<ProductResponse>('/v1/products', product);
    return response.data as Product;
  },

  async update(id: number, product: ProductRequest): Promise<Product> {
    const response = await apiClient.request<ProductResponse>(`/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return response.data as Product;
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<ProductResponse>(`/v1/products/${id}`, {
      method: 'DELETE',
    });
  },

  async updateStatus(id: number, currentStatus: number): Promise<Product> {
    // Use dedicated endpoint that only updates status
    const newStatus = currentStatus === 1 ? 0 : 1;
    const response = await apiClient.request<ProductResponse>(
      `/v1/products/${id}/status?status=${newStatus}`,
      { method: 'PATCH' }
    );
    return response.data as Product;
  },
};
