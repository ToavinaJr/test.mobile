import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts, setSearch, setSelectedCategory, setCurrentPage } from '@/store/product-slice';
import { useLocalSearchParams } from 'expo-router';

export const useProducts = () => {
  // Extraction des données et états du slice produit dans Redux
  const { products, loading, error, search, selectedCategory, currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.products
  );
  // Dispatch Redux pour envoyer des actions
  const dispatch = useDispatch<AppDispatch>();

  // Lecture des paramètres de recherche locale (ex : URL query params)
  const params = useLocalSearchParams();

  // Effet pour charger la liste des produits au montage et à chaque changement du paramètre 'refresh'
  useEffect(() => {
    dispatch(fetchProducts()); // Chargement initial des produits

    if (params.refresh) {
      dispatch(fetchProducts()); // Rechargement si paramètre refresh détecté
    }
  }, [dispatch, params.refresh]);

  // Calcul des catégories distinctes à partir des produits (pour filtres)
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category ?? 'Autres')); // Prise en compte catégorie null ou indéfinie
    return ['Tous', ...Array.from(set)]; // Ajout d’une catégorie 'Tous' en première position
  }, [products]);

  // Filtrage des produits selon la catégorie sélectionnée et recherche texte (avant pagination)
  const filteredAndSearchedProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = !selectedCategory ? true : p.category === selectedCategory;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [selectedCategory, search, products]
  );

  // Pagination des produits filtrés
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSearchedProducts.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredAndSearchedProducts]);

  // Calcul du nombre total de pages pour la pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSearchedProducts.length / itemsPerPage);
  }, [filteredAndSearchedProducts.length, itemsPerPage]);

  // Gestionnaire de changement de la barre de recherche : met à jour le store Redux
  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setSearch(value));
    },
    [dispatch]
  );

  // Gestionnaire de sélection de catégorie : met à jour la catégorie sélectionnée dans Redux
  const handleCategorySelect = useCallback(
    (cat: string) => {
      dispatch(setSelectedCategory(cat === 'Tous' ? null : cat)); // 'Tous' signifie aucune sélection
    },
    [dispatch]
  );

  // Gestionnaire de changement de page (pagination)
  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  // Retourne les données nécessaires pour l’affichage et les contrôles dans le composant
  return {
    products: paginatedProducts,              // Produits filtrés et paginés pour affichage
    loading,                                  // Indicateur de chargement
    error,                                    // Message d’erreur
    search,                                   // Texte de recherche en cours
    selectedCategory,                         // Catégorie sélectionnée
    categories,                               // Liste des catégories pour le filtre
    filteredProducts: filteredAndSearchedProducts, // Produits filtrés mais non paginés (utile pour infos)
    currentPage,                              // Page courante
    itemsPerPage,                             // Nombre d’items par page
    totalPages,                              // Nombre total de pages
    totalFilteredProducts: filteredAndSearchedProducts.length, // Nombre total produits filtrés
    handleSearchChange,                       // Handler modification recherche
    handleCategorySelect,                     // Handler changement catégorie
    handlePageChange,                         // Handler changement page
  };
};
