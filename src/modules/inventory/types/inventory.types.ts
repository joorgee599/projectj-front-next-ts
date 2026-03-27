export type InventoryStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface InventoryDetail {
  id: number;
  inventoryId: number;
  productId: number;
  productName?: string;
  providerId?: number;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inventory {
  id: number;
  description?: string;
  userId: number;
  document?: string;
  status: InventoryStatus;
  referenceType?: string;
  referenceId?: number;
  details: InventoryDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryDetailRequest {
  productId: number;
  providerId?: number;
  type: MovementType;
  quantity: number;
  unitCost?: number;
}

export interface CreateInventoryRequest {
  description?: string;
  document?: string;
  userId: number;
  referenceType?: string;
  referenceId?: number;
  details: InventoryDetailRequest[];
}

export interface UpdateInventoryRequest {
  description?: string;
  document?: string;
  referenceType?: string;
  referenceId?: number;
  details?: InventoryDetailRequest[];
}
