import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        let fetchedPosts: Article[] = [];
        if (isAdmin) {
          await dataService.pingAdmin();
          const articlesRes = await dataService.getArticles({ size: 100 });
          fetchedPosts = articlesRes.items;

          setAllUsers([]);
          setAllComments([]);

          const counts: Record<string, number> = {};
          fetchedPosts.forEach((post) => {
            const category = post.categoryName || '其它';
            counts[category] = (counts[category] || 0) + 1;
          });
          setCategoryData(Object.entries(counts).map(([name, value]) => ({ name, value })));
        } else {
          const res = await dataService.getMyArticles({ size: 100 });
          fetchedPosts = res.items;
          setLikedPosts([]);
        }

        setPosts(fetchedPosts);
        setHasMore(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
