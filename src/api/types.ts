import {
  AdminOverview,
  AdminUser,
  Article,
  AuthResponse,
  Comment,
  PageResult,
  PageResponse,
  SystemSettings,
} from '../types';
import { ArticleSortCode, ArticleVisibilityCode, GenderCode, UserRoleCode } from './enums';

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
  sort?: ArticleSortCode;
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
  visibility: ArticleVisibilityCode;
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
  gender?: GenderCode;
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
  role?: UserRoleCode;
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

export interface LikedArticleDto {
  articleId: number;
  authorId: number;
  authorNickname?: string | null;
  authorAvatarUrl?: string | null;
  title: string;
  summary?: string | null;
  coverUrl?: string | null;
  categoryId: number;
  categoryName?: string | null;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  publishedAt?: string | null;
  likedAt: string;
}

export type AdminOverviewDto = AdminOverview;

export interface AdminUserListItemDto {
  id: number;
  username: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  role: UserRoleCode;
  status: number;
  articleCount?: number;
  commentCount?: number;
  createdAt: string;
  lastLoginAt?: string | null;
}

export type AdminUserPageDto = PageResult<AdminUserListItemDto>;

export interface AdminUserListParams {
  keyword?: string;
  role?: UserRoleCode;
  status?: number;
  page?: number;
  size?: number;
}

export interface BanUserRequest {
  reason: string;
}

export type AdminUserPage = PageResult<AdminUser>;

export interface CategoryDto {
  categoryId: number;
  name: string;
  description?: string | null;
  enabled: boolean;
}

export interface CommentUserDto {
  id: number;
  nickname?: string | null;
  avatarUrl?: string | null;
}

export interface ArticleCommentDto {
  id: number;
  commentUser: CommentUserDto;
  content: string;
  createdAt: string;
  replyCount?: number;
  deletable?: boolean;
}

export interface CommentReplyDto {
  id: number;
  articleId: number;
  rootId: number;
  parentId: number;
  user: CommentUserDto;
  replyToUser?: CommentUserDto | null;
  content: string;
  createdAt: string;
  deletable?: boolean;
}

export interface CursorPageParams {
  cursor?: string;
  size?: number;
}

export type CommentPageParams = CursorPageParams;

export interface CommentRequest {
  content: string;
}

export interface ArticleCommentPage extends Omit<PageResponse<ArticleCommentDto>, 'items'> {
  items: ArticleCommentDto[];
}

export interface CommentReplyPage extends Omit<PageResponse<CommentReplyDto>, 'items'> {
  items: CommentReplyDto[];
}

export type CommentMapper = (dto: ArticleCommentDto | CommentReplyDto, articleId?: number) => Comment;
