import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Product } from '@/types';
import { getProductById } from '@/services/products.services';

export const useProductDetail = (productId: string | string[] | undefined) => {
  const allProductsInStore = useSelector((state: RootState) => state.products.products);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const id = Array.isArray(productId) ? productId[0] : productId;

      const cachedProduct = allProductsInStore.find((p: Product) => p.id === id);
      if (cachedProduct) {
        setProduct(cachedProduct);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
      } catch (err: any) {
        console.error("Error fetching product by ID:", err);
        setError(err.message || "Impossible de charger les détails du produit.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, allProductsInStore]);

  return { product, loading, error };
};
