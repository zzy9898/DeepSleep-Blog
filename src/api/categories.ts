import { ApiResponse, Category } from '../types';
import { apiClient, unwrapData } from './client';
import { mapCategory } from './mappers';
import { CategoryDto } from './types';

export async function getCategories(): Promise<Category[]> {
  const categories = await unwrapData(apiClient.get<ApiResponse<CategoryDto[]>>('/categories'));
  return categories.map(mapCategory);
}
