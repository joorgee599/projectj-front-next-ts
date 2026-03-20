import { apiClient, ApiResponse } from '@/core/api/client';
import { Role, RoleRequest } from '../types/role.types';

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/v1/roles');
    console.log('Fetched roles:', response.data);
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`/v1/roles/${id}`);
    return response.data;
  },

  create: async (data: RoleRequest): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>('/v1/roles', data);
    return response.data;
  },

  update: async (id: number, data: RoleRequest): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/v1/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/roles/${id}`);
  },

  assignPermission: async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient.post(`/v1/roles/${roleId}/permissions/${permissionId}`, {});
  },

  removePermission: async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient.delete(`/v1/roles/${roleId}/permissions/${permissionId}`);
  },
};
