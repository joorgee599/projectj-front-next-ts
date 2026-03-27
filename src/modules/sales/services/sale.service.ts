import { apiClient } from '@/core/api/client';
import {
  CreateSaleRequest,
  Sale,
  SaleApiEnvelope,
  SaleDetail,
  UpdateSaleRequest,
} from '../types/sale.types';

const BASE_URL = '/v1/sales';

export const saleService = {
  async getAll(): Promise<Sale[]> {
    const response = await apiClient.get<SaleApiEnvelope<Sale[]>>(BASE_URL);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: number): Promise<Sale> {
    const response = await apiClient.get<SaleApiEnvelope<Sale>>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async getByClientId(clientId: number): Promise<Sale[]> {
    const response = await apiClient.get<SaleApiEnvelope<Sale[]>>(`${BASE_URL}/client/${clientId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  async create(payload: CreateSaleRequest): Promise<Sale> {
    const response = await apiClient.post<SaleApiEnvelope<Sale>>(BASE_URL, payload);
    return response.data;
  },

  async update(id: number, payload: UpdateSaleRequest): Promise<Sale> {
    const response = await apiClient.put<SaleApiEnvelope<Sale>>(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<SaleApiEnvelope<null>>(`${BASE_URL}/${id}`);
  },

  async confirm(id: number): Promise<Sale> {
    const response = await apiClient.patch<SaleApiEnvelope<Sale>>(`${BASE_URL}/${id}/confirm`);
    return response.data;
  },

  async cancel(id: number): Promise<Sale> {
    const response = await apiClient.patch<SaleApiEnvelope<Sale>>(`${BASE_URL}/${id}/cancel`);
    return response.data;
  },

  async getCurrentCart(clientId: number): Promise<Sale | null> {
    const response = await apiClient.get<SaleApiEnvelope<Sale | null>>(`${BASE_URL}/cart/current?clientId=${clientId}`);
    return response.data ?? null;
  },

  async getOrCreateCart(clientId: number, userId: number): Promise<Sale> {
    const response = await apiClient.get<SaleApiEnvelope<Sale>>(
      `${BASE_URL}/cart?clientId=${clientId}&userId=${userId}`
    );
    return response.data;
  },

  async addItem(saleId: number, detail: Pick<SaleDetail, 'productId' | 'quantity'>): Promise<Sale> {
    const response = await apiClient.post<SaleApiEnvelope<Sale>>(`${BASE_URL}/${saleId}/items`, detail);
    return response.data;
  },

  async updateItem(saleId: number, detailId: number, quantity: number): Promise<Sale> {
    const response = await apiClient.patch<SaleApiEnvelope<Sale>>(
      `${BASE_URL}/${saleId}/items/${detailId}?quantity=${quantity}`
    );
    return response.data;
  },

  async removeItem(saleId: number, detailId: number): Promise<Sale> {
    const response = await apiClient.delete<SaleApiEnvelope<Sale>>(`${BASE_URL}/${saleId}/items/${detailId}`);
    return response.data;
  },
};