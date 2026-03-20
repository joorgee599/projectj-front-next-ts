export interface Client {
  id: number;
  userId: number;
  name: string;
  email: string;
  document: string;
  phone: string;
  address: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: string;
  temporaryPassword?: string;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
  address?: string;
  status?: number;
}
