export type SaleStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface SaleDetail {
  id?: number;
  saleId?: number;
  productId: number;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id: number;
  clientId?: number | null;
  userId: number;
  totalAmount: number;
  paymentMethod?: string | null;
  description?: string | null;
  status: SaleStatus;
  details: SaleDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSaleRequest {
  clientId?: number | null;
  userId: number;
  paymentMethod?: string;
  description?: string;
  details: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface UpdateSaleRequest {
  clientId?: number | null;
  userId?: number;
  paymentMethod?: string;
  description?: string;
  details?: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface SaleApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}