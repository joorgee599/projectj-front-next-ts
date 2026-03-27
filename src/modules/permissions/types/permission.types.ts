export interface Permission {
  id: number;
  name: string;
  description?: string;
  module?: string;
  createdAt?: string;
}

export interface PermissionRequest {
  name: string;
  description?: string;
  module?: string;
}
