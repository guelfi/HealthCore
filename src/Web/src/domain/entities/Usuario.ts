import { UserProfile } from '../enums/UserProfile';

export interface Usuario {
  id: string;
  username: string;
  role: UserProfile;
  isActive: boolean;
  createdAt?: Date; // Opcional pois pode vir como string do backend
  updatedAt?: Date; // Opcional pois pode vir como string do backend
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

// Interface compatível com LoginResponseDto do backend
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string | Date; // Backend envia como string ISO
  user: {
    id: string;
    username: string;
    role: number; // Backend envia como número
    isActive: boolean;
  };
}