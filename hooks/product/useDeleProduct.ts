import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct as deleteProductAction } from '@/store/product-slice';
import { AppDispatch, RootState } from '@/store';
import { Product } from '@/types';
import { getProductById } from '@/services/products-services';
import { Alert } from 'react-native';

export const useDeleteProduct = (productId: string | string[] | undefined) => {
  const dispatch = useDispatch<AppDispatch>();
  const { deletingProduct, deleteProductError, products: allProductsInStore } = useSelector(
    (state: RootState) => state.products
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      const id = Array.isArray(productId) ? productId[0] : productId;
      let productData: Product | null = allProductsInStore.find((p: Product) => p.id === id) || null;

      if (!productData) {
        try {
          productData = await getProductById(id);
        } catch (err: any) {
          Alert.alert('Erreur', err.message || 'Échec du chargement du produit.');
          setLoading(false);
          return;
        }
      }
      setProduct(productData);
      setLoading(false);
    };
    loadProduct();
  }, [productId, allProductsInStore]);

  const handleDelete = async () => {
    if (!product || !product.id) {
      Alert.alert('Erreur', 'ID du produit manquant pour la suppression.');
      return;
    }
    const resultAction = await dispatch(deleteProductAction(product.id));
    if (deleteProductAction.fulfilled.match(resultAction)) {
      Alert.alert('Succès', 'Produit supprimé avec succès !');
      setDeleteSuccess(true);
    } else {
      Alert.alert('Erreur', (resultAction.payload as string) || 'Échec de la suppression du produit.');
    }
  };

  return {
    product,
    loading,
    deleting: deletingProduct,
    deleteError: deleteProductError,
    handleDelete,
    deleteSuccess
  };
};