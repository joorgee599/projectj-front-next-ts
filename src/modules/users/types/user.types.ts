export type { Role } from '@/modules/roles/types/role.types';

export interface User {
  id: number;
  name: string;
  email: string;
  roleIds?: number[];
  roleNames?: string[];
  permissionIds?: number[];
  permissionNames?: string[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  roleIds: number[];
  permissionIds: number[];
  status?: number;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User | User[] | null;
}
