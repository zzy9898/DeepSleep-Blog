import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiResponse, AuthResponse } from '../types';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './tokenStore';
import { BUSINESS_CODE } from './businessCodes';

const DEFAULT_API_BASE_URL = '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

async function refreshTokenAndRetry(originalRequest: RetryableRequestConfig) {
  if (originalRequest._retry || originalRequest.url === '/auth/refresh') {
    return Promise.reject(new Error('Unable to refresh token'));
  }

  originalRequest._retry = true;
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const refreshRes = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
    setTokens(accessToken, newRefreshToken);
    originalRequest.headers.token = accessToken;

    return apiClient(originalRequest);
  } catch (refreshError) {
    clearTokens();
    window.location.href = '/auth';
    return Promise.reject(refreshError);
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  async (response) => {
    const res = response.data as ApiResponse<unknown>;
    if (res.code === BUSINESS_CODE.AUTH_ACCESS_TOKEN_EXPIRED) {
      return refreshTokenAndRetry(response.config as RetryableRequestConfig);
    }

    if (res.code !== BUSINESS_CODE.SUCCESS) {
      return Promise.reject(res);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const res = error.response?.data as ApiResponse<unknown> | undefined;

    if (res?.code === BUSINESS_CODE.AUTH_ACCESS_TOKEN_EXPIRED && originalRequest) {
      return refreshTokenAndRetry(originalRequest);
    }

    return Promise.reject(res || error);
  },
);

export async function unwrapData<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data;
}
