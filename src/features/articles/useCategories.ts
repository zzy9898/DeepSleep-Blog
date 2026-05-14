import { useCallback, useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Category } from '../../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dataService.getCategories();
      setCategories(data.filter((category) => category.enabled));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    refetch: fetchCategories,
  };
}
