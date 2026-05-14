import { apiClient } from './client';

export async function pingPublic() {
  const res = await apiClient.get('/ping/public');
  return res.data;
}

export async function pingAuth() {
  const res = await apiClient.get('/ping/auth');
  return res.data;
}

export async function pingAdmin() {
  const res = await apiClient.get('/ping/admin');
  return res.data;
}
