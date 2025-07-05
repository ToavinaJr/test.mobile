import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Product } from '@/types';
import { getProductById } from '@/services/products-services';

export const useProductDetail = (productId: string | string[] | undefined) => {
  // Récupération de tous les produits présents dans le store Redux
  const allProductsInStore = useSelector((state: RootState) => state.products.products);

  // État local pour stocker le produit à afficher
  const [product, setProduct] = useState<Product | null>(null);
  // Indicateur local de chargement pour l'affichage UI
  const [loading, setLoading] = useState(true);
  // État local pour gérer l'affichage d'erreurs lors de la récupération
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction asynchrone pour récupérer les détails du produit
    const fetchProduct = async () => {
      // Si aucun productId, on reset l'état
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }

      // Gestion du cas où productId est un tableau (ex: route params)
      const id = Array.isArray(productId) ? productId[0] : productId;

      // Tentative de récupération du produit dans le store Redux (cache local)
      const cachedProduct = allProductsInStore.find((p: Product) => p.id === id);
      if (cachedProduct) {
        // Si trouvé en cache, on met à jour l’état et stoppe la recherche
        setProduct(cachedProduct);
        setLoading(false);
        setError(null);
        return;
      }

      // Sinon, on déclenche la récupération distante (API)
      setLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
      } catch (err: any) {
        // En cas d’erreur, on log et met à jour l’état erreur
        console.error("Error fetching product by ID:", err);
        setError(err.message || "Impossible de charger les détails du produit.");
        setProduct(null);
      } finally {
        // Fin du chargement dans tous les cas
        setLoading(false);
      }
    };

    // Exécution de la fonction de récupération à chaque changement de productId ou du store
    fetchProduct();
  }, [productId, allProductsInStore]);

  // Retourne le produit, l’état de chargement et l’éventuelle erreur au composant
  return { product, loading, error };
};
