import { apiClient } from '@/core/api/client';
import { Client, ClientRequest, UpdateClientRequest } from '../types/client.types';

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>('/v1/clients');
    return Array.isArray(response.data) ? response.data : [];
  },

  getById: async (id: number): Promise<Client> => {
    const response = await apiClient.get<Client>(`/v1/clients/${id}`);
    return response.data;
  },

  create: async (client: ClientRequest): Promise<Client> => {
    const response = await apiClient.post<Client>('/v1/clients', client);
    return response.data;
  },

  update: async (id: number, client: UpdateClientRequest): Promise<Client> => {
    const response = await apiClient.put<Client>(`/v1/clients/${id}`, client);
    return response.data;
  },

  updateStatus: async (id: number, status: number): Promise<Client> => {
    const response = await apiClient.patch<Client>(`/v1/clients/${id}/status?status=${status}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/clients/${id}`);
  }
};
