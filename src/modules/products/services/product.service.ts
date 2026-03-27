import { apiClient } from '@/core/api/client';
import { Product, ProductResponse, ProductSubmission } from '../types/product.types';

const buildProductFormData = (product: ProductSubmission): FormData => {
  const formData = new FormData();

  formData.append('name', product.name);
  formData.append('description', product.description ?? '');
  formData.append('code', product.code);
  formData.append('price', String(product.price));
  formData.append('categoryId', String(product.categoryId));
  formData.append('brandId', String(product.brandId));

  if (product.status != null) {
    formData.append('status', String(product.status));
  }

  if (product.stock != null) {
    formData.append('stock', String(product.stock));
  }

  if (product.minStock != null) {
    formData.append('minStock', String(product.minStock));
  }

  if (product.maxStock != null) {
    formData.append('maxStock', String(product.maxStock));
  }

  if (product.imageFile) {
    formData.append('imageFile', product.imageFile);
  }

  return formData;
};

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<ProductResponse>('/v1/products');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<ProductResponse>(`/v1/products/${id}`);
    return response.data as Product;
  },

  async create(product: ProductSubmission): Promise<Product> {
    const response = await apiClient.post<ProductResponse>('/v1/products', buildProductFormData(product));
    return response.data as Product;
  },

  async update(id: number, product: ProductSubmission): Promise<Product> {
    const response = await apiClient.put<ProductResponse>(`/v1/products/${id}`, buildProductFormData(product));
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
