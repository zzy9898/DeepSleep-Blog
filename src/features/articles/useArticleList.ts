import { useCallback, useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Article } from '../../types';

const POSTS_PER_PAGE = 6;

export function useArticleList(searchParams: URLSearchParams) {
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (isInitial = false, cursor?: string | null) => {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await dataService.getArticles({
          cursor: isInitial ? undefined : (cursor || undefined),
          size: POSTS_PER_PAGE,
          categoryId: activeCategoryId || undefined,
          keyword: searchTerm || undefined,
        });

        setHasMore(res.hasMore);
        setNextCursor(res.nextCursor);
        setPosts((prev) => (isInitial ? res.items : [...prev, ...res.items]));
      } catch (error) {
        console.error('Error fetching posts:', error);
        if (isInitial) {
          setPosts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategoryId, searchTerm],
  );

  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSearchTerm(`#${tagParam}`);
    }
    fetchPosts(true);
  }, [activeCategoryId, fetchPosts, searchParams]);

  return {
    posts,
    filteredPosts: posts,
    loading,
    loadingMore,
    searchTerm,
    setSearchTerm,
    activeCategoryId,
    setActiveCategoryId,
    hasMore,
    fetchMorePosts: () => fetchPosts(false, nextCursor),
  };
}
