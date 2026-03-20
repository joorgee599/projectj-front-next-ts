import { apiClient, ApiResponse } from '@/core/api/client';
import { Permission, PermissionRequest } from '../types/permission.types';

export const permissionService = {
  getAll: async (): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>('/v1/permissions');
    return response.data;
  },

  getById: async (id: number): Promise<Permission> => {
    const response = await apiClient.get<ApiResponse<Permission>>(`/v1/permissions/${id}`);
    return response.data;
  },

  create: async (data: PermissionRequest): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<Permission>>('/v1/permissions', data);
    return response.data;
  },

  update: async (id: number, data: PermissionRequest): Promise<Permission> => {
    const response = await apiClient.put<ApiResponse<Permission>>(`/v1/permissions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/permissions/${id}`);
  },
};
