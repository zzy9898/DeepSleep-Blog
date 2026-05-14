import { SystemSettings } from '../types';
import { apiClient } from './client';
import { UpdateSettingsRequest } from './types';

export async function getSettings(): Promise<SystemSettings> {
  return {
    siteName: 'DeepSleep Blog',
    siteSubtitle: '一个沉浸式的数字花园',
    allowRegistration: true,
    commentReviewRequired: false,
    postsPerPage: 10,
    sensitiveWords: [],
  };
}

export async function updateSettings(settings: UpdateSettingsRequest): Promise<void> {
  await apiClient.put('/settings', settings);
}
