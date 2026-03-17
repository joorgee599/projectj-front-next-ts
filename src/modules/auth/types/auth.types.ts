export interface User {
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}
