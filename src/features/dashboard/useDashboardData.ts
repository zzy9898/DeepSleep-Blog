import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/errors';
import { dataService } from '../../services/dataService';
import { Article, Comment, SystemSettings, UserProfile } from '../../types';

export interface CategoryDatum {
  name: string;
  value: number;
}

export function useDashboardData(user: UserProfile | null, isAdmin: boolean, authLoading: boolean) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Article[]>([]);
  const [likedPosts, setLikedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDatum[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'DeepSleep Blog',
    siteSubtitle: '探索数字艺术与极简生活',
    allowRegistration: true,
    commentReviewRequired: false,
    postsPerPage: 10,
    sensitiveWords: [],
  });

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
        let fetchedPosts: Article[] = [];
        if (isAdmin) {
          await dataService.pingAdmin();
          fetchedPosts = await dataService.getAllArticles();

          setAllUsers([]);
          setAllComments([]);

          const counts: Record<string, number> = {};
          fetchedPosts.forEach((post) => {
            const category = post.categoryName || '其它';
            counts[category] = (counts[category] || 0) + 1;
          });
          setCategoryData(Object.entries(counts).map(([name, value]) => ({ name, value })));
        } else {
          fetchedPosts = await dataService.getAllMyArticles();
          setLikedPosts([]);
        }

        setPosts(fetchedPosts);
        setHasMore(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setErrorMessage(getApiErrorMessage(error, '暂时无法加载文章列表，请稍后再试。'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAdmin, user],
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
    allUsers,
    allComments,
    setAllComments,
    categoryData,
    systemSettings,
    setSystemSettings,
  };
}
