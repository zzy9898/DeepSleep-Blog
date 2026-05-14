import { useCallback, useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Article, Comment } from '../../types';

export function useArticleDetail(id?: string) {
  const [post, setPost] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      setComments([]);

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
      setRelatedPosts([]);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return {
    post,
    comments,
    setComments,
    relatedPosts,
    loading,
    notFound,
    refetch: fetchArticle,
  };
}
