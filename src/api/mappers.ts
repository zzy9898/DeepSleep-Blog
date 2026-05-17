import { AdminUser, Article, Category, UserProfile } from '../types';
import {
  AdminUserListItemDto,
  ArticleCommentDto,
  ArticleDto,
  CategoryDto,
  CommentReplyDto,
  LikedArticleDto,
  UserDto,
} from './types';
import { ArticleStatusCode, UserRoleCode } from './enums';

export function mapUser(dto: UserDto): UserProfile {
  return {
    id: dto.id,
    username: dto.username,
    displayName: dto.nickname || dto.username,
    role: dto.role === UserRoleCode.Admin ? 'admin' : 'user',
    status: dto.status ?? 0,
    createdAt: dto.createdAt || '',
    bio: dto.bio || '',
    avatarUrl: dto.avatarUrl || undefined,
    bannerUrl: dto.backgroundImageUrl || undefined,
  };
}

export function mapAdminUser(dto: AdminUserListItemDto): AdminUser {
  return {
    id: dto.id,
    username: dto.username,
    displayName: dto.nickname || dto.username,
    avatarUrl: dto.avatarUrl || undefined,
    role: dto.role === UserRoleCode.Admin ? 'admin' : 'user',
    status: dto.status,
    articleCount: dto.articleCount ?? 0,
    commentCount: dto.commentCount ?? 0,
    createdAt: dto.createdAt,
    lastLoginAt: dto.lastLoginAt ?? null,
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
    liked: dto.liked ?? false,
    createdAt: dto.createdAt || '',
    updatedAt: dto.updatedAt || '',
    publishedAt: dto.publishedAt ?? null,
  };
}

export function mapLikedArticle(dto: LikedArticleDto): Article {
  return {
    id: dto.articleId,
    title: dto.title,
    content: dto.summary || '',
    summary: dto.summary ?? null,
    coverKey: dto.coverUrl ?? null,
    authorId: dto.authorId,
    authorName: dto.authorNickname ?? null,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName ?? null,
    tags: [],
    status: ArticleStatusCode.Published,
    viewCount: dto.viewCount ?? 0,
    likeCount: dto.likeCount ?? 0,
    commentCount: dto.commentCount ?? 0,
    liked: true,
    createdAt: dto.likedAt,
    updatedAt: dto.likedAt,
    publishedAt: dto.publishedAt ?? null,
  };
}

export function mapArticleComment(dto: ArticleCommentDto, articleId: number) {
  return {
    id: dto.id,
    articleId,
    authorId: dto.commentUser.id,
    authorName: dto.commentUser.nickname || `用户 ${dto.commentUser.id}`,
    authorAvatarUrl: dto.commentUser.avatarUrl || undefined,
    content: dto.content,
    replyCount: dto.replyCount ?? 0,
    deletable: dto.deletable ?? false,
    createdAt: dto.createdAt,
  };
}

export function mapCommentReply(dto: CommentReplyDto) {
  return {
    id: dto.id,
    articleId: dto.articleId,
    rootId: dto.rootId,
    parentId: dto.parentId,
    authorId: dto.user.id,
    authorName: dto.user.nickname || `用户 ${dto.user.id}`,
    authorAvatarUrl: dto.user.avatarUrl || undefined,
    replyToName: dto.replyToUser?.nickname || undefined,
    content: dto.content,
    deletable: dto.deletable ?? false,
    createdAt: dto.createdAt,
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
