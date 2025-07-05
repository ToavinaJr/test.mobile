import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct as deleteProductAction } from '@/store/product-slice';
import { AppDispatch, RootState } from '@/store';
import { Product } from '@/types';
import { getProductById } from '@/services/products-services';
import { Alert } from 'react-native';

export const useDeleteProduct = (productId: string | string[] | undefined) => {
  // Accès au dispatch Redux typé
  const dispatch = useDispatch<AppDispatch>();

  // Récupération des états liés à la suppression dans le store Redux
  const { deletingProduct, deleteProductError, products: allProductsInStore } = useSelector(
    (state: RootState) => state.products
  );

  // State local pour stocker le produit ciblé à supprimer
  const [product, setProduct] = useState<Product | null>(null);
  // Indicateur local de chargement (récupération du produit)
  const [loading, setLoading] = useState(true);
  // Indicateur local de succès de suppression (pour gestion UI après suppression)
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  /**
   * Effet déclenché au montage ou quand productId ou la liste des produits dans le store change
   * But : charger les données du produit à supprimer
   * - Si produit trouvé dans le store, on l’utilise
   * - Sinon on fait un appel API pour le récupérer
   * - Gère les erreurs réseau/API avec Alert et met à jour loading
   */
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        return; // Pas d’ID => pas de produit à charger
      }

      // Gestion cas où productId est tableau (route param)
      const id = Array.isArray(productId) ? productId[0] : productId;

      // Recherche dans le store local pour éviter appel inutile
      let productData: Product | null = allProductsInStore.find((p: Product) => p.id === id) || null;

      // Si non trouvé dans le store, récupération via service API
      if (!productData) {
        try {
          productData = await getProductById(id);
        } catch (err: any) {
          Alert.alert('Erreur', err.message || 'Échec du chargement du produit.');
          setLoading(false);
          return;
        }
      }

      // Mise à jour du produit et fin du chargement
      setProduct(productData);
      setLoading(false);
    };

    loadProduct();
  }, [productId, allProductsInStore]);

  /**
   * Fonction déclenchée pour supprimer le produit
   * - Vérifie que le produit et son id existent
   * - Déclenche l’action Redux asynchrone deleteProduct
   * - Selon le résultat, affiche un message succès ou erreur via Alert
   * - Met à jour un flag local deleteSuccess pour informer l’UI/suivi
   */
  const handleDelete = async () => {
    if (!product || !product.id) {
      Alert.alert('Erreur', 'ID du produit manquant pour la suppression.');
      return;
    }

    const resultAction = await dispatch(deleteProductAction(product.id));

    if (deleteProductAction.fulfilled.match(resultAction)) {
      Alert.alert('Succès', 'Produit supprimé avec succès !');
      setDeleteSuccess(true); // Indique que la suppression a réussi
    } else {
      Alert.alert('Erreur', (resultAction.payload as string) || 'Échec de la suppression du produit.');
    }
  };

  // Retourne les données et fonctions nécessaires à l’UI appelante
  return {
    product,           // Produit à supprimer (ou null si non chargé)
    loading,           // Indicateur de chargement du produit
    deleting: deletingProduct,  // Indicateur global de suppression (depuis Redux)
    deleteError: deleteProductError,  // Erreur de suppression globale (Redux)
    handleDelete,      // Fonction pour lancer la suppression
    deleteSuccess      // Indicateur local succès suppression (utile pour navigation/rafraîchissement)
  };
};
