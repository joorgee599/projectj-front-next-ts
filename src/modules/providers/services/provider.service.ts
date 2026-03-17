import { apiClient } from '@/core/api/client';
import { Provider, ProviderRequest, ProviderResponse } from '../types/provider.types';

export const providerService = {
  async getAll(): Promise<Provider[]> {
    const response = await apiClient.get<ProviderResponse>('/v1/providers');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: number): Promise<Provider> {
    const response = await apiClient.get<ProviderResponse>(`/v1/providers/${id}`);
    return response.data as Provider;
  },

  async create(provider: ProviderRequest): Promise<Provider> {
    const response = await apiClient.post<ProviderResponse>('/v1/providers', provider);
    return response.data as Provider;
  },

  async update(id: number, provider: ProviderRequest): Promise<Provider> {
    const response = await apiClient.request<ProviderResponse>(`/v1/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(provider),
    });
    return response.data as Provider;
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<ProviderResponse>(`/v1/providers/${id}`, {
      method: 'DELETE',
    });
  },

  async updateStatus(id: number, currentStatus: number): Promise<Provider> {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const response = await apiClient.request<ProviderResponse>(
      `/v1/providers/${id}/status?status=${newStatus}`,
      { method: 'PATCH' }
    );
    return response.data as Provider;
  },
};
