import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/errors';
import { dataService } from '../../services/dataService';
import { Article, UserProfile } from '../../types';

export function useDashboardData(user: UserProfile | null, authLoading: boolean) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Article[]>([]);
  const [likedPosts, setLikedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchDashboardData = useCallback(
    async (isInitial = false) => {
      if (!user) return;
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        setErrorMessage(null);
        const [myArticles, myLikedArticles] = await Promise.all([
          dataService.getAllMyArticles(),
          dataService.getAllLikedArticles(),
        ]);

        setPosts(myArticles);
        setLikedPosts(myLikedArticles);
        setHasMore(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setErrorMessage(getApiErrorMessage(error, '暂时无法加载文章列表，请稍后再试。'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData(true);
  }, [authLoading, fetchDashboardData, navigate, user]);

  return {
    posts,
    setPosts,
    likedPosts,
    errorMessage,
    loading,
    loadingMore,
    hasMore,
  };
}
