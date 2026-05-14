import { apiClient } from './client';

export async function deleteComment(id: number): Promise<void> {
  await apiClient.delete(`/comments/${id}`);
}
