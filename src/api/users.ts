import { ApiResponse, UserProfile } from '../types';
import { apiClient, unwrapData } from './client';
import { mapUser } from './mappers';
import {
  UpdateAvatarResponse,
  UpdateBackgroundImageResponse,
  UpdateProfileRequest,
  UserDto,
} from './types';

export async function getProfile(id: number): Promise<UserProfile> {
  const user = await unwrapData(apiClient.get<ApiResponse<UserDto>>(`/users/${id}`));
  return mapUser(user);
}

export async function getCurrentUser(): Promise<UserProfile> {
  const user = await unwrapData(apiClient.get<ApiResponse<UserDto>>('/users/me'));
  return mapUser(user);
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const user = await unwrapData(apiClient.put<ApiResponse<UserDto>>('/users/me/profile', data));
  return mapUser(user);
}

export async function updateAvatar(file: File): Promise<UpdateAvatarResponse> {
  const formData = new FormData();
  formData.append('avatar', file);

  return unwrapData(
    apiClient.put<ApiResponse<UpdateAvatarResponse>>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  );
}

export async function updateBackgroundImage(file: File): Promise<UpdateBackgroundImageResponse> {
  const formData = new FormData();
  formData.append('backgroundImage', file);

  return unwrapData(
    apiClient.put<ApiResponse<UpdateBackgroundImageResponse>>('/users/me/background-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  );
}
