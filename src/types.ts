export interface UserThemeConfig {
  accentColor: string;
  backgroundType: 'gradient' | 'solid' | 'mesh';
  fontFamily: 'sans' | 'serif' | 'mono';
  cardStyle: 'glass' | 'brutal' | 'minimal';
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  coverKey: string | null;
  authorId: number;
  authorName: string | null;
  categoryId: number;
  categoryName: string | null;
  tags: Tag[];
  status: number; // 0: Draft, 1: Published, 2: Hidden
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  timestamp: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PageResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Comment {
  id: number;
  articleId: number;
  authorName: string;
  authorId?: number;
  content: string;
  parentId?: number;
  createdAt: string;
  replies?: Comment[];
}

export interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  role: 'user' | 'admin';
  status: number;
  createdAt: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  themeConfig?: UserThemeConfig;
}

export interface SystemSettings {
  siteName: string;
  siteSubtitle: string;
  allowRegistration: boolean;
  commentReviewRequired: boolean;
  postsPerPage: number;
  sensitiveWords: string[];
}
