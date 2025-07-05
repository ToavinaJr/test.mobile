import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts, setSearch, setSelectedCategory } from '@/store/product-slice';
import { Product } from '@/types';
import { useLocalSearchParams } from 'expo-router';

export const useProducts = () => {
  const { products, loading, error, search, selectedCategory } = useSelector(
    (state: RootState) => state.products
  );
  const dispatch = useDispatch<AppDispatch>();

  const params = useLocalSearchParams();

  useEffect(() => {
    dispatch(fetchProducts());

    if (params.refresh) {
      dispatch(fetchProducts());
    }
  }, [dispatch, params.refresh]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category ?? 'Autres'));
    return ['Tous', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = !selectedCategory ? true : p.category === selectedCategory;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [selectedCategory, search, products]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setSearch(value));
    },
    [dispatch]
  );

  const handleCategorySelect = useCallback(
    (cat: string) => {
      dispatch(setSelectedCategory(cat === 'Tous' ? null : cat));
    },
    [dispatch]
  );

  return {
    products,
    loading,
    error,
    search,
    selectedCategory,
    categories,
    filteredProducts,
    handleSearchChange,
    handleCategorySelect,
  };
};
