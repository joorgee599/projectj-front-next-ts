export interface Provider {
  id: number;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderRequest {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  status?: number;
}

export interface ProviderResponse {
  success: boolean;
  message: string;
  data: Provider | Provider[] | null;
}
