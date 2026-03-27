import { apiClient, ApiResponse } from '@/core/api/client';
import {
  Inventory,
  CreateInventoryRequest,
  UpdateInventoryRequest,
} from '../types/inventory.types';

export const inventoryService = {
  async getAll(): Promise<Inventory[]> {
    const response = await apiClient.get<ApiResponse<Inventory[]>>('/v1/inventories');
    return response.data;
  },

  async getById(id: number): Promise<Inventory> {
    const response = await apiClient.get<ApiResponse<Inventory>>(`/v1/inventories/${id}`);
    return response.data;
  },

  async create(data: CreateInventoryRequest): Promise<Inventory> {
    const response = await apiClient.post<ApiResponse<Inventory>>('/v1/inventories', data);
    return response.data;
  },

  async update(id: number, data: UpdateInventoryRequest): Promise<Inventory> {
    const response = await apiClient.put<ApiResponse<Inventory>>(`/v1/inventories/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/v1/inventories/${id}`);
  },

  async confirm(id: number): Promise<Inventory> {
    const response = await apiClient.request<ApiResponse<Inventory>>(
      `/v1/inventories/${id}/confirm`,
      { method: 'PATCH' }
    );
    return response.data;
  },

  async cancel(id: number): Promise<Inventory> {
    const response = await apiClient.request<ApiResponse<Inventory>>(
      `/v1/inventories/${id}/cancel`,
      { method: 'PATCH' }
    );
    return response.data;
  },
};
