import type { LoginDto, AuthResponse, Usuario } from '../entities/Usuario';

export interface IAuthService {
  login(credentials: LoginDto): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResponse>;
  getCurrentUser(): Promise<Usuario>;
  validateToken(token: string): Promise<boolean>;
}
