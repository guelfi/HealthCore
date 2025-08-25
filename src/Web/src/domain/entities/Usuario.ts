import { UserProfile } from '../enums/UserProfile';

export interface Usuario {
  id: string;
  username: string;
  role: UserProfile;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUsuarioDto {
  username: string;
  password: string;
  role: UserProfile;
}

export interface UpdateUsuarioDto {
  username?: string;
  password?: string;
  role?: UserProfile;
  isActive?: boolean;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: Usuario;
  expiresAt: Date;
}