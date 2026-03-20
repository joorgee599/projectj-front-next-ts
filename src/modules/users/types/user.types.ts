export type { Role } from '@/modules/roles/types/role.types';

export interface User {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  roleName?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  roleId: number;
  status?: number;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User | User[] | null;
}
