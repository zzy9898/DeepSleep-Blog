import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import { dataService } from '../../services/dataService';
import { AdminOverview } from '../../types';

export interface CategoryDatum {
  name: string;
  value: number;
}

export function useAdminOverview() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [, nextOverview, allArticles] = await Promise.all([
        dataService.pingAdmin(),
        dataService.getAdminOverview(),
        dataService.getAllArticles(),
      ]);

      const counts: Record<string, number> = {};
      allArticles.forEach((article) => {
        const category = article.categoryName || '其它';
        counts[category] = (counts[category] || 0) + 1;
      });

      setOverview(nextOverview);
      setCategoryData(Object.entries(counts).map(([name, value]) => ({ name, value })));
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      setErrorMessage(getApiErrorMessage(error, '暂时无法加载管理概览，请稍后再试。'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overview,
    categoryData,
    loading,
    errorMessage,
    refetch: fetchOverview,
  };
}
