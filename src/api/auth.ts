import { ApiResponse, AuthResponse } from '../types';
import { apiClient, unwrapData } from './client';
import { clearTokens } from './tokenStore';
import {
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
} from './types';

export function login(data: LoginRequest): Promise<AuthResponse> {
  return unwrapData(apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data));
}

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return unwrapData(apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data));
}

export async function logout({ refreshToken }: LogoutRequest): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
  clearTokens();
}

export async function logoutAll({ refreshToken }: LogoutRequest): Promise<void> {
  await apiClient.post('/auth/logout-all', { refreshToken });
  clearTokens();
}
