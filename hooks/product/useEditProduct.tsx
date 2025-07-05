import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ZodError } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Keyboard } from 'react-native';
import { EditProductFormInput, editProductSchema } from '@/schemas/product/product-edit.schema';
import { updateExistingProduct } from '@/store/product-slice';
import { AppDispatch, RootState } from '@/store';
import { Product, ProductCategory } from '@/types';
import { getProductById } from '@/services/products.services';

export const useEditProduct = (productId: string | string[] | undefined) => {
  const dispatch = useDispatch<AppDispatch>();
  const { updatingProduct, updateProductError, products: allProductsInStore } = useSelector(
    (state: RootState) => state.products
  );

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<EditProductFormInput>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    vendor: '',
    category: ProductCategory.OTHER,
    imageUrl: '',
    isActive: true,
  });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [errors, setErrors] = useState<Partial<Record<keyof EditProductFormInput, string>>>({});

  const originalProductRef = useRef<Product | null>(null);

  const hasChanges = useCallback(() => {
    if (!originalProductRef.current) return false;

    const original = originalProductRef.current;
    const current = {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      vendor: form.vendor,
      category: form.category,
      imageUrl: imageUri,
      isActive: form.isActive,
    };

    for (const key in current) {
      if (key === 'description' || key === 'category') {
        const originalValue = original[key] === null || original[key] === undefined ? '' : String(original[key]);
        const currentValue = current[key] === null || current[key] === undefined ? '' : String(current[key]);
        if (originalValue !== currentValue) {
          return true;
        }
      } else if (key === 'imageUrl') {
        const originalImg = original.imageUrl || '';
        const currentImg = current.imageUrl || '';
        if (originalImg !== currentImg) {
          return true;
        }
      }
      else if (original[key as keyof Product] !== current[key as keyof typeof current]) {
        return true;
      }
    }
    return false;
  }, [form, imageUri]);

  const resetForm = useCallback(() => {
    const p = originalProductRef.current;
    if (!p) return;
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      stock: p.stock,
      vendor: p.vendor,
      category: p.category,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
    });
    setImageUri(p.imageUrl ?? null);
    setErrors({});
  }, []);

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
        } catch (err) {
          Alert.alert('Erreur', (err as Error).message, [{ text: 'OK', onPress: () => Keyboard.dismiss() }]);
          setLoading(false);
          return;
        }
      }

      if (productData) {
        originalProductRef.current = productData;
        setForm({
          name: productData.name,
          description: productData.description ?? '',
          price: productData.price,
          stock: productData.stock,
          vendor: productData.vendor,
          category: productData.category,
          imageUrl: productData.imageUrl,
          isActive: productData.isActive,
        });
        setImageUri(productData.imageUrl ?? null);
      } else {
        Alert.alert('Erreur', 'Produit introuvable', [{ text: 'OK', onPress: () => Keyboard.dismiss() }]);
      }
      setLoading(false);
    };

    loadProduct();
  }, [productId, allProductsInStore]);

  const handleChangeField = useCallback((field: keyof EditProductFormInput, value: any) => {
    setForm(prevForm => {
      const updatedForm = { ...prevForm, [field]: value };
      try {
        editProductSchema.pick({ [field]: true } as never).parse({ [field]: value });
        setErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
      } catch (e) {
        if (e instanceof ZodError) {
          setErrors(prevErrors => ({ ...prevErrors, [field]: e.errors[0]?.message }));
        }
      }
      return updatedForm;
    });
  }, []);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Veuillez autoriser l’accès à votre galerie pour choisir une image.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled) {
      const src = res.assets[0].uri;
      const name = src.split('/').pop()!;
      if (!FileSystem.documentDirectory) {
        Alert.alert('Erreur', 'Impossible d’accéder au répertoire de documents.');
        return;
      }
      const dst = FileSystem.documentDirectory + name;
      try {
        await FileSystem.copyAsync({ from: src, to: dst });
        setImageUri(dst);
        handleChangeField('imageUrl', dst);
      } catch (error) {
        console.error("Error copying image:", error);
        Alert.alert('Erreur', 'Impossible de copier l’image. Veuillez réessayer.');
      }
    }
  }, [handleChangeField]);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    setErrors({});

    if (!productId) {
      Alert.alert('Erreur', 'ID du produit manquant pour la mise à jour.');
      return { success: false, error: 'Product ID missing' };
    }

    const id = Array.isArray(productId) ? productId[0] : productId;

    try {
      const validatedData = editProductSchema.parse({ ...form, imageUrl: imageUri || '' });

      const payload: Partial<Product> = {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        stock: validatedData.stock,
        vendor: validatedData.vendor,
        category: validatedData.category,
        imageUrl: imageUri || '',
        isActive: validatedData.isActive,
      };

      const resultAction = await dispatch(updateExistingProduct({ id, data: payload }));

      if (updateExistingProduct.fulfilled.match(resultAction)) {
        Alert.alert('Succès', 'Produit mis à jour avec succès !');
        originalProductRef.current = resultAction.payload;
        setImageUri(resultAction.payload.imageUrl ?? null);
        return { success: true };
      } else {
        const errorMessage = updateProductError || (resultAction.payload as string) || 'Erreur inconnue lors de la mise à jour.';
        Alert.alert('Erreur', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (e) {
      if (e instanceof ZodError) {
        const newErrors: Partial<Record<keyof EditProductFormInput, string>> = {};
        e.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as keyof EditProductFormInput] = err.message;
          }
        });
        setErrors(newErrors);
        Alert.alert('Validation', 'Veuillez corriger les erreurs dans le formulaire.');
      } else {
        Alert.alert('Erreur', 'Une erreur inattendue est survenue lors de la validation.');
      }
      return { success: false, error: 'Validation failed' };
    }
  }, [form, imageUri, productId, dispatch, updateProductError]);

  return {
    form,
    loading,
    errors,
    updatingProduct,
    updateProductError,
    handleChange: handleChangeField,
    handleSubmit,
    hasChanges,
    resetForm,
    imageUri,
    pickImage,
  };
};