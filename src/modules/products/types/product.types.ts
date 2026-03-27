export interface Product {
  id: number;
  name: string;
  description?: string;
  code: string;
  price: number;
  image?: string;
  categoryId: number;
  categoryName?: string;
  brandId: number;
  brandName?: string;
  status: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  code: string;
  price: number;
  image?: string;
  categoryId: number;
  brandId: number;
  status?: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
}

export interface ProductSubmission extends ProductRequest {
  imageFile?: File | null;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product | Product[] | null;
}
