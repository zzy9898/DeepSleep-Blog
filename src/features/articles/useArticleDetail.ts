import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import { dataService } from '../../services/dataService';
import { Article, Comment } from '../../types';

function replaceRepliesForRoot(comments: Comment[], rootCommentId: number, replies: Comment[]): Comment[] {
  return comments.flatMap((comment) => {
    if (!comment.parentId && comment.id === rootCommentId) {
      return [comment, ...replies];
    }

    if (comment.rootId === rootCommentId || comment.parentId === rootCommentId) {
      return [];
    }

    return [comment];
  });
}

export function useArticleDetail(id?: string) {
  const [post, setPost] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentErrorMessage, setCommentErrorMessage] = useState<string | null>(null);
  const [loadingReplyRootIds, setLoadingReplyRootIds] = useState<Set<number>>(new Set());
  const [expandedReplyRootIds, setExpandedReplyRootIds] = useState<Set<number>>(new Set());

  const fetchComments = useCallback(async (articleId: number) => {
    try {
      setCommentErrorMessage(null);
      setLoadingReplyRootIds(new Set());
      setExpandedReplyRootIds(new Set());
      const fetchedComments = await dataService.getInitialArticleComments(articleId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      setLoadingReplyRootIds(new Set());
      setExpandedReplyRootIds(new Set());
      setCommentErrorMessage(getApiErrorMessage(error, '暂时无法加载评论，请稍后再试。'));
    }
  }, []);

  const loadCommentReplies = useCallback(async (rootCommentId: number) => {
    setLoadingReplyRootIds((current) => new Set(current).add(rootCommentId));
    setCommentErrorMessage(null);

    try {
      const replies = await dataService.getAllCommentReplies(rootCommentId);
      setComments((current) => replaceRepliesForRoot(current, rootCommentId, replies));
      setExpandedReplyRootIds((current) => new Set(current).add(rootCommentId));
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      setCommentErrorMessage(getApiErrorMessage(error, '暂时无法展开回复，请稍后再试。'));
    } finally {
      setLoadingReplyRootIds((current) => {
        const next = new Set(current);
        next.delete(rootCommentId);
        return next;
      });
    }
  }, []);

  const fetchArticle = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    try {
      const fetchedPost = await dataService.getArticleDetail(Number(id));
      setPost(fetchedPost);
      await fetchComments(fetchedPost.id);

      if (fetchedPost.categoryId) {
        const relatedRes = await dataService.getArticles({ categoryId: fetchedPost.categoryId, size: 3 });
        setRelatedPosts(relatedRes.items.filter((item) => item.id !== fetchedPost.id).slice(0, 2));
      } else {
        setRelatedPosts([]);
      }
    } catch (error) {
      console.error('Error fetching article detail:', error);
      setPost(null);
      setComments([]);
      setCommentErrorMessage(null);
      setLoadingReplyRootIds(new Set());
      setExpandedReplyRootIds(new Set());
      setRelatedPosts([]);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [fetchComments, id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return {
    post,
    comments,
    setComments,
    setPost,
    relatedPosts,
    loading,
    notFound,
    commentErrorMessage,
    loadingReplyRootIds,
    expandedReplyRootIds,
    loadCommentReplies,
    refetchComments: () => (post ? fetchComments(post.id) : Promise.resolve()),
    refetch: fetchArticle,
  };
}
