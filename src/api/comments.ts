import { ApiResponse, Comment, PageResponse } from '../types';
import { apiClient, unwrapData } from './client';
import { mapArticleComment, mapCommentReply } from './mappers';
import {
  ArticleCommentDto,
  CommentPageParams,
  CommentReplyDto,
  CommentRequest,
} from './types';

const COMMENT_PAGE_SIZE = 10;

function mergeReplies(comments: Comment[], repliesByRootId: Map<number, Comment[]>): Comment[] {
  return comments.flatMap((comment) => [comment, ...(repliesByRootId.get(comment.id) || [])]);
}

async function collectCommentPages<T>(
  fetchPage: (params: CommentPageParams) => Promise<PageResponse<T>>,
  params: CommentPageParams = {},
): Promise<T[]> {
  const items: T[] = [];
  const seenCursors = new Set<string>();
  let cursor = params.cursor;

  while (true) {
    const page = await fetchPage({
      ...params,
      cursor: cursor || undefined,
      size: params.size ?? COMMENT_PAGE_SIZE,
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

export async function createComment(articleId: number, data: CommentRequest): Promise<void> {
  await apiClient.post(`/articles/${articleId}/comments`, data);
}

export async function replyComment(commentId: number, data: CommentRequest): Promise<void> {
  await apiClient.post(`/comments/${commentId}`, data);
}

export async function getArticleComments(articleId: number, params: CommentPageParams = {}): Promise<PageResponse<Comment>> {
  const response = await unwrapData(
    apiClient.get<ApiResponse<PageResponse<ArticleCommentDto>>>(`/articles/${articleId}/comments`, { params }),
  );

  return {
    ...response,
    items: response.items.map((item) => mapArticleComment(item, articleId)),
  };
}

export async function getCommentReplies(commentId: number, params: CommentPageParams = {}): Promise<PageResponse<Comment>> {
  const response = await unwrapData(
    apiClient.get<ApiResponse<PageResponse<CommentReplyDto>>>(`/comments/${commentId}/replies`, { params }),
  );

  return {
    ...response,
    items: response.items.map(mapCommentReply),
  };
}

export async function getAllArticleComments(articleId: number): Promise<Comment[]> {
  const parentComments = await collectCommentPages((params) => getArticleComments(articleId, params));
  const replyEntries = await Promise.all(
    parentComments
      .filter((comment) => (comment.replyCount ?? 0) > 0)
      .map(async (comment) => [comment.id, await collectCommentPages((params) => getCommentReplies(comment.id, params))] as const),
  );

  return mergeReplies(parentComments, new Map(replyEntries));
}

export async function deleteComment(id: number): Promise<void> {
  await apiClient.delete(`/api/comments/${id}`);
}
