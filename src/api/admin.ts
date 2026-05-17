import { AdminOverview, ApiResponse } from '../types';
import { apiClient, unwrapData } from './client';
import { mapAdminUser } from './mappers';
import {
  AdminOverviewDto,
  AdminUserListParams,
  AdminUserPage,
  AdminUserPageDto,
  BanUserRequest,
} from './types';

export async function getAdminOverview(): Promise<AdminOverview> {
  return unwrapData(apiClient.get<ApiResponse<AdminOverviewDto>>('/overview'));
}

export async function getAdminUsers(params: AdminUserListParams = {}): Promise<AdminUserPage> {
  const response = await unwrapData(apiClient.get<ApiResponse<AdminUserPageDto>>('/users', { params }));

  return {
    ...response,
    records: response.records.map(mapAdminUser),
  };
}

export async function banUser(userId: number, data: BanUserRequest): Promise<void> {
  await apiClient.post(`/users/${userId}/ban`, data);
}

export async function unbanUser(userId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}/ban`);
}
