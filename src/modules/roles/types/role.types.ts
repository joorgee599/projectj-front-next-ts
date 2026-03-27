export interface Permission {
  id: number;
  name: string;
  description?: string;
  module?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt?: string;
}

export interface RoleRequest {
  name: string;
  description: string;
  permissionIds?: number[];
}
