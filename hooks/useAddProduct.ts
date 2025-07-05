import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ZodError } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Keyboard } from 'react-native';
import { AddProductFormInput, addProductSchema } from '@/schemas/product/product-add.schema';
import { addNewProduct } from '@/store/product-slice';
import { AppDispatch, RootState } from '@/store';
import { Product } from '@/types';
import { ProductCategory } from '@/types/ProductCategory';

export const useAddProduct = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { addingProduct, addProductError } = useSelector((state: RootState) => state.products);

  const [form, setForm] = useState<AddProductFormInput>({
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

  const [errors, setErrors] = useState<Partial<Record<keyof AddProductFormInput, string>>>({});

  const handleChange = useCallback((field: keyof AddProductFormInput, value: any) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
    try {
      addProductSchema.pick({ [field]: true } as never ).parse({ [field]: value });
      setErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
    } catch (e) {
      if (e instanceof ZodError) {
        setErrors(prevErrors => ({ ...prevErrors, [field]: e.errors[0]?.message }));
      }
    }
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
        handleChange('imageUrl', dst);
      } catch (error) {
        console.error("Error copying image:", error);
        Alert.alert('Erreur', 'Impossible de copier l’image. Veuillez réessayer.');
      }
    }
  }, [handleChange]);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    setErrors({});

    try {
      const validatedData = addProductSchema.parse({ ...form, imageUrl: imageUri || '' });

      const payload: Omit<Product, 'id'> = {
        name: validatedData.name,
        description: validatedData.description as string,
        price: validatedData.price,
        stock: validatedData.stock,
        vendor: validatedData.vendor,
        category: validatedData.category as ProductCategory,
        imageUrl: validatedData.imageUrl,
        isActive: validatedData.isActive,
      };

      const resultAction = await dispatch(addNewProduct(payload));

      if (addNewProduct.fulfilled.match(resultAction)) {
        Alert.alert('Succès', 'Produit ajouté avec succès !');
        return { success: true };
      } else {
        const errorMessage = addProductError || resultAction.payload as string || 'Erreur inconnue lors de l\'ajout.';
        Alert.alert('Erreur', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (e) {
      if (e instanceof ZodError) {
        const newErrors: Partial<Record<keyof AddProductFormInput, string>> = {};
        e.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as keyof AddProductFormInput] = err.message;
          }
        });
        setErrors(newErrors);
        Alert.alert('Validation', 'Veuillez corriger les erreurs dans le formulaire.');
      } else {
        Alert.alert('Erreur', 'Une erreur inattendue est survenue lors de la validation.');
      }
      return { success: false, error: 'Validation failed' };
    }
  }, [form, imageUri, dispatch, addProductError]);

  return {
    form,
    imageUri,
    errors,
    addingProduct,
    addProductError,
    handleChange,
    pickImage,
    handleSubmit,
    setForm,
    setImageUri,
  };
};
