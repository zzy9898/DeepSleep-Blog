import { ApiResponse, Article, PageResponse } from '../types';
import { apiClient, unwrapData } from './client';
import { mapArticle } from './mappers';
import {
  ArticleDto,
  ArticleListParams,
  CreateArticleRequest,
  CreateDraftRequest,
  UpdateArticleRequest,
} from './types';

const ARTICLE_PAGE_SIZE = 10;

function mapArticlePage(response: PageResponse<ArticleDto>): PageResponse<Article> {
  return {
    ...response,
    items: response.items.map(mapArticle),
  };
}

async function collectArticleItems(
  fetchPage: (params: ArticleListParams) => Promise<PageResponse<Article>>,
  params: ArticleListParams = {},
): Promise<Article[]> {
  const items: Article[] = [];
  const seenCursors = new Set<string>();
  let cursor = params.cursor;

  while (true) {
    const page = await fetchPage({
      ...params,
      cursor: cursor || undefined,
      size: params.size ?? ARTICLE_PAGE_SIZE,
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

export async function getArticles(params: ArticleListParams = {}): Promise<PageResponse<Article>> {
  const response = await unwrapData(apiClient.get<ApiResponse<PageResponse<ArticleDto>>>('/articles', { params }));
  return mapArticlePage(response);
}

export async function getAllArticles(params: ArticleListParams = {}): Promise<Article[]> {
  return collectArticleItems(getArticles, params);
}

export async function getArticleDetail(id: number): Promise<Article> {
  const article = await unwrapData(apiClient.get<ApiResponse<ArticleDto>>(`/articles/${id}`));
  return mapArticle(article);
}

export async function createArticle(data: CreateArticleRequest): Promise<Article> {
  const article = await unwrapData(apiClient.post<ApiResponse<ArticleDto>>('/articles', data));
  return mapArticle(article);
}

export async function createDraft(data: CreateDraftRequest): Promise<Article> {
  const article = await unwrapData(apiClient.post<ApiResponse<ArticleDto>>('/articles/drafts', data));
  return mapArticle(article);
}

export async function updateArticle(id: number, data: UpdateArticleRequest): Promise<Article> {
  const article = await unwrapData(apiClient.put<ApiResponse<ArticleDto>>(`/articles/${id}`, data));
  return mapArticle(article);
}

export async function deleteArticle(id: number): Promise<void> {
  await apiClient.delete(`/articles/${id}`);
}

export async function publishDraft(id: number): Promise<void> {
  await apiClient.post(`/articles/${id}/publish`);
}

export async function unpublishArticle(id: number): Promise<void> {
  await apiClient.post(`/articles/${id}/unpublish`);
}

export async function likeArticle(id: number): Promise<void> {
  await apiClient.post(`/articles/${id}/like`);
}

export async function unlikeArticle(id: number): Promise<void> {
  await apiClient.delete(`/articles/${id}/like`);
}

export async function getMyArticles(params: ArticleListParams = {}): Promise<PageResponse<Article>> {
  const response = await unwrapData(apiClient.get<ApiResponse<PageResponse<ArticleDto>>>('/articles/mine', { params }));
  return mapArticlePage(response);
}

export async function getAllMyArticles(params: ArticleListParams = {}): Promise<Article[]> {
  return collectArticleItems(getMyArticles, params);
}
