import { Article, Comment, UserProfile } from '../types';

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: '探索数字艺术的无限可能',
    summary: '深入了解 WebGL 与数字创作的魅力。',
    content: '在 DeepSleep Blog，我们不仅记录生活，更在探索未来的轮廓...',
    authorId: 101,
    authorName: '林深见鹿',
    categoryId: 1,
    categoryName: '技术',
    tags: [{ id: 1, name: '数字艺术' }, { id: 2, name: '创意编程' }],
    status: 1,
    viewCount: 1240,
    likeCount: 88,
    commentCount: 12,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    publishedAt: '2024-03-01T10:00:00Z',
    coverKey: null
  },
  {
    id: 2,
    title: '极简主义在现代网页设计中的应用',
    summary: 'Less is More: 探讨简约美学的设计哲学。',
    content: '在这个信息过载的时代，清爽的 Blog 体验变得尤为珍贵...',
    authorId: 102,
    authorName: '设计的温度',
    categoryId: 2,
    categoryName: '设计',
    tags: [{ id: 3, name: '极简' }, { id: 4, name: 'UI/UX' }],
    status: 1,
    viewCount: 890,
    likeCount: 56,
    commentCount: 8,
    createdAt: '2024-02-28T14:30:00Z',
    updatedAt: '2024-02-28T14:30:00Z',
    publishedAt: '2024-02-28T14:30:00Z',
    coverKey: null
  }
];

export const MOCK_POSTS = MOCK_ARTICLES;

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    articleId: 1,
    authorName: '代码之诗',
    authorId: 201,
    content: '非常深刻的见解，受益匪浅。',
    createdAt: '2024-03-01T11:20:00Z'
  }
];

export const MOCK_ADMIN_PROFILE: UserProfile = {
  id: 1,
  username: 'admin',
  displayName: 'DeepSleep 官方',
  role: 'admin',
  status: 1,
  createdAt: '2024-01-01T00:00:00Z',
  bio: '探索技术与生活的边界。',
  avatarUrl: undefined,
  bannerUrl: undefined,
};
