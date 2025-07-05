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
import { getProductById } from '@/services/products-services';

export const useEditProduct = (productId: string | string[] | undefined) => {
  // Redux dispatch typé pour déclencher actions asynchrones
  const dispatch = useDispatch<AppDispatch>();

  // Sélection dans le store des états liés à la mise à jour produit
  const { updatingProduct, updateProductError, products: allProductsInStore } = useSelector(
    (state: RootState) => state.products
  );

  // Indicateur local de chargement pour la récupération du produit
  const [loading, setLoading] = useState(true);

  // État local du formulaire d’édition initialisé vide
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

  // URI locale de l’image sélectionnée (copiée dans le système de fichiers)
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Erreurs de validation Zod pour chaque champ
  const [errors, setErrors] = useState<Partial<Record<keyof EditProductFormInput, string>>>({});

  // Ref pour conserver la version originale du produit (chargé une seule fois)
  // Permet de comparer le formulaire actuel et détecter les modifications
  const originalProductRef = useRef<Product | null>(null);

  /**
   * Fonction qui détermine s'il y a eu des modifications par rapport au produit original.
   * Compare champ par champ, en traitant certains champs (description, category, imageUrl) avec précaution
   * pour gérer les null/undefined et les différences de type.
   */
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

  /**
   * Réinitialise le formulaire à l’état initial du produit original chargé.
   * Remet également à zéro les erreurs et remet à jour l’image locale.
   */
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

  /**
   * Effet de chargement du produit à éditer au montage ou au changement de productId ou du store
   * Tente de trouver le produit dans le store local
   * Sinon, récupère via l’API avec gestion d’erreur (Alert + Keyboard dismiss)
   * Stocke le produit original dans un ref et remplit le formulaire et imageUri
   */
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

  /**
   * Gestion du changement d’un champ du formulaire.
   * Met à jour le formulaire, valide uniquement le champ modifié avec Zod,
   * met à jour les erreurs spécifiques au champ si besoin.
   */
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

  /**
   * Fonction pour choisir une image depuis la galerie utilisateur.
   * - Demande la permission d’accès
   * - Lance la sélection d’image (uniquement images, édition possible, qualité 0.8)
   * - Copie localement l’image dans le répertoire documentDirectory
   * - Met à jour l’URI locale et met à jour le champ imageUrl dans le formulaire
   * - Gère les erreurs avec Alert et console.error
   */
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

  /**
   * Soumission du formulaire pour mettre à jour le produit.
   * - Validation complète avec Zod (form + imageUri)
   * - Construction du payload partiel
   * - Déclenche l’action Redux updateExistingProduct
   * - En cas de succès, met à jour la référence originale et imageUri, affiche succès
   * - En cas d’erreur (validation ou action Redux), affiche alert adaptée et met à jour erreurs
   */
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
        // Mise à jour du produit original avec la version à jour
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
        // Gestion spécifique des erreurs de validation, affichage détaillé
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

  // Retourne tout ce dont un composant a besoin pour gérer l’édition
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
