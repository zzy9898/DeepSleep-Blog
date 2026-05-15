import {
  Article,
  AuthResponse,
  SystemSettings,
} from '../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export type RegisterRequest = LoginRequest;
export type RegisterInput = RegisterRequest;

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ArticleListParams {
  cursor?: string;
  size?: number;
  categoryId?: number;
  authorId?: number;
  tagId?: number;
  status?: Article['status'];
  keyword?: string;
  sort?: 0 | 1;
}

export interface ArticleMutationRequest {
  title: string;
  content: string;
  summary?: string;
  coverKey?: string;
  categoryId: number;
  tagNames?: string[];
}

export interface CreateArticleRequest extends ArticleMutationRequest {
  visibility: number;
}

export type CreateDraftRequest = ArticleMutationRequest;

export type UpdateArticleRequest = Partial<
  ArticleMutationRequest & {
    status: Article['status'];
  }
>;

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  gender?: 0 | 1 | 2;
}

export type UpdateSettingsRequest = SystemSettings;

export type AuthDto = AuthResponse;

export interface UserDto {
  id: number;
  username: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  backgroundImageUrl?: string | null;
  bio?: string | null;
  role?: 0 | 1;
  status?: number;
  createdAt?: string | null;
}

export interface UpdateAvatarResponse {
  avatarKey: string;
  avatarUrl: string;
}

export interface UpdateBackgroundImageResponse {
  backgroundImageKey: string;
  backgroundImageUrl: string;
}

export interface TagDto {
  id: number;
  name: string;
}

export interface ArticleDto {
  id: number;
  title: string;
  content?: string | null;
  summary?: string | null;
  coverKey?: string | null;
  coverUrl?: string | null;
  authorId?: number;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  categoryId: number;
  categoryName?: string | null;
  tags?: TagDto[];
  status?: number;
  statusDesc?: string;
  visibility?: number;
  visibilityDesc?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  liked?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

export interface CategoryDto {
  categoryId: number;
  name: string;
  description?: string | null;
  enabled: boolean;
}
