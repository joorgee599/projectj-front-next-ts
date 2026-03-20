import { apiClient } from '@/core/api/client';
import { User, UserRequest, UserResponse, Role } from '../types/user.types';

import { roleService as remoteRoleService } from '@/modules/roles/services/role.service';

export const roleService = {
  getAll: remoteRoleService.getAll,
};

const BASE_URL = '/v1/users';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<UserResponse>(BASE_URL);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: number): Promise<User> {
    const response = await apiClient.get<UserResponse>(`${BASE_URL}/${id}`);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error('User not found');
    }
    return response.data;
  },

  async create(user: UserRequest): Promise<User> {
    console.log('Creating user with data:', user);
    
    const response = await apiClient.post<UserResponse>(BASE_URL, user);
    return response.data as User;
  },

  async update(id: number, user: UserRequest): Promise<User> {
    const response = await apiClient.request<UserResponse>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    return response.data as User;
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  async updateStatus(id: number, currentStatus: number): Promise<User> {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const response = await apiClient.request<UserResponse>(
      `${BASE_URL}/${id}/status?status=${newStatus}`,
      { method: 'PATCH' }
    );
    return response.data as User;
  },
};

