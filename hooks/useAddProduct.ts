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

const INITIAL_FORM: AddProductFormInput = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  vendor: '',
  category: ProductCategory.OTHER,
  imageUrl: '',
  isActive: true,
};

export const useAddProduct = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { addingProduct, addProductError } = useSelector((state: RootState) => state.products);

  const [form, setForm] = useState<AddProductFormInput>(INITIAL_FORM);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AddProductFormInput, string>>>({});

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setImageUri(null);
    setErrors({});
  }, []);

  const handleChange = useCallback((field: keyof AddProductFormInput, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    try {
      addProductSchema.pick({ [field]: true } as never).parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (e) {
      if (e instanceof ZodError) {
        setErrors(prev => ({ ...prev, [field]: e.errors[0]?.message }));
      }
    }
  }, []);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Veuillez autoriser l’accès à votre galerie.');
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
        Alert.alert('Erreur', 'Accès répertoire documents impossible.');
        return;
      }
      const dst = FileSystem.documentDirectory + name;
      try {
        await FileSystem.copyAsync({ from: src, to: dst });
        setImageUri(dst);
        handleChange('imageUrl', dst);
      } catch {
        Alert.alert('Erreur', 'Impossible de copier l’image.');
      }
    }
  }, [handleChange]);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    setErrors({});
    try {
      const validated = addProductSchema.parse({ ...form, imageUrl: imageUri || '' });
      const payload: Omit<Product, 'id'> = {
        name: validated.name,
        description: validated.description as string,
        price: validated.price,
        stock: validated.stock,
        vendor: validated.vendor,
        category: validated.category as ProductCategory,
        imageUrl: validated.imageUrl,
        isActive: validated.isActive,
      };
      const action = await dispatch(addNewProduct(payload));
      if (addNewProduct.fulfilled.match(action)) {
        Alert.alert('Succès', 'Produit ajouté avec succès !');
        return { success: true };
      }
      const msg = addProductError || (action.payload as string) || 'Erreur inconnue.';
      Alert.alert('Erreur', msg);
      return { success: false, error: msg };
    } catch (e) {
      if (e instanceof ZodError) {
        const newErrs: Partial<Record<keyof AddProductFormInput, string>> = {};
        e.errors.forEach(err => {
          if (err.path.length) newErrs[err.path[0] as keyof AddProductFormInput] = err.message;
        });
        setErrors(newErrs);
        Alert.alert('Validation', 'Corrigez les erreurs du formulaire.');
      } else {
        Alert.alert('Erreur', 'Erreur inattendue.');
      }
      return { success: false, error: 'Validation failed' };
    }
  }, [form, imageUri, dispatch, addProductError]);

  return {
    form,
    imageUri,
    errors,
    addingProduct,
    handleChange,
    pickImage,
    handleSubmit,
    resetForm,
  };
};
