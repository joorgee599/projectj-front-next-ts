export interface Category {
  id: number;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
  status?: number;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category | Category[] | null;
}
