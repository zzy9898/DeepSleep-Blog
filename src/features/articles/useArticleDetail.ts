import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import { dataService } from '../../services/dataService';
import { Article, Comment } from '../../types';

export function useArticleDetail(id?: string) {
  const [post, setPost] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentErrorMessage, setCommentErrorMessage] = useState<string | null>(null);

  const fetchComments = useCallback(async (articleId: number) => {
    try {
      setCommentErrorMessage(null);
      const fetchedComments = await dataService.getAllArticleComments(articleId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      setCommentErrorMessage(getApiErrorMessage(error, '暂时无法加载评论，请稍后再试。'));
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
    refetchComments: () => (post ? fetchComments(post.id) : Promise.resolve()),
    refetch: fetchArticle,
  };
}
