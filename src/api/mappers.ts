import { Article, Category, UserProfile } from '../types';
import { ArticleDto, CategoryDto, UserDto } from './types';

export function mapUser(dto: UserDto): UserProfile {
  return {
    id: dto.id,
    username: dto.username,
    displayName: dto.nickname || dto.username,
    role: dto.role === 0 ? 'admin' : 'user',
    status: dto.status ?? 0,
    createdAt: dto.createdAt || '',
    bio: dto.bio || '',
    avatarUrl: dto.avatarUrl || undefined,
    bannerUrl: dto.backgroundImageUrl || undefined,
  };
}

export function mapArticle(dto: ArticleDto): Article {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content || dto.summary || '',
    summary: dto.summary ?? null,
    coverKey: dto.coverKey ?? dto.coverUrl ?? null,
    authorId: dto.authorId ?? 0,
    authorName: dto.authorName ?? null,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName ?? null,
    tags: dto.tags || [],
    status: dto.status ?? 1,
    viewCount: dto.viewCount ?? 0,
    likeCount: dto.likeCount ?? 0,
    commentCount: dto.commentCount ?? 0,
    createdAt: dto.createdAt || '',
    updatedAt: dto.updatedAt || '',
    publishedAt: dto.publishedAt ?? null,
  };
}

export function mapCategory(dto: CategoryDto): Category {
  return {
    categoryId: dto.categoryId,
    name: dto.name,
    description: dto.description || '',
    enabled: dto.enabled,
  };
}
