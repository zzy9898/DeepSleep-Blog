import { ApiResponse, Article, PageResponse, UserProfile } from '../types';
import { apiClient, unwrapData } from './client';
import { mapLikedArticle, mapUser } from './mappers';
import {
  CursorPageParams,
  LikedArticleDto,
  UpdateAvatarResponse,
  UpdateBackgroundImageResponse,
  UpdateProfileRequest,
  UserDto,
} from './types';

const LIKED_ARTICLE_PAGE_SIZE = 10;

function mapLikedArticlePage(response: PageResponse<LikedArticleDto>): PageResponse<Article> {
  return {
    ...response,
    items: response.items.map(mapLikedArticle),
  };
}

async function collectLikedArticleItems(params: CursorPageParams = {}): Promise<Article[]> {
  const items: Article[] = [];
  const seenCursors = new Set<string>();
  let cursor = params.cursor;

  while (true) {
    const page = await getLikedArticles({
      ...params,
      cursor: cursor || undefined,
      size: params.size ?? LIKED_ARTICLE_PAGE_SIZE,
    });

    items.push(...page.items);

    if (!page.hasMore || !page.nextCursor || seenCursors.has(page.nextCursor)) {
      break;
    }

    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  return items;
}

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

export async function getLikedArticles(params: CursorPageParams = {}): Promise<PageResponse<Article>> {
  const response = await unwrapData(
    apiClient.get<ApiResponse<PageResponse<LikedArticleDto>>>('/users/me/liked-articles', { params }),
  );

  return mapLikedArticlePage(response);
}

export async function getAllLikedArticles(params: CursorPageParams = {}): Promise<Article[]> {
  return collectLikedArticleItems(params);
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
