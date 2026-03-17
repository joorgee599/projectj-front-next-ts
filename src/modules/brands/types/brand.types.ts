export interface Brand {
  id: number;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandRequest {
  name: string;
  description: string;
  status?: number;
}

export interface BrandResponse {
  success: boolean;
  message: string;
  data: Brand | Brand[] | null;
}
