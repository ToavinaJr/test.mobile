import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts, setSearch, setSelectedCategory, setCurrentPage } from '@/store/product-slice';
import { useLocalSearchParams } from 'expo-router';

export const useProducts = () => {
  const { products, loading, error, search, selectedCategory, currentPage, itemsPerPage } = useSelector(
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

  // Appliquer le filtrage avant la pagination
  const filteredAndSearchedProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = !selectedCategory ? true : p.category === selectedCategory;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [selectedCategory, search, products]
  );

  // Appliquer la pagination sur les produits filtrés
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSearchedProducts.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredAndSearchedProducts]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSearchedProducts.length / itemsPerPage);
  }, [filteredAndSearchedProducts.length, itemsPerPage]);

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

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  return {
    products: paginatedProducts,
    loading,
    error,
    search,
    selectedCategory,
    categories,
    filteredProducts: filteredAndSearchedProducts,
    currentPage,
    itemsPerPage,
    totalPages,
    totalFilteredProducts: filteredAndSearchedProducts.length,
    handleSearchChange,
    handleCategorySelect,
    handlePageChange,
  };
};
