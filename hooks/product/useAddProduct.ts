import { useState, useCallback, useEffect } from 'react';
import { Alert, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ZodError } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { AddProductFormInput, addProductSchema } from '@/schemas/product/product-add.schema';
import { addNewProduct } from '@/store/product-slice';
import { AppDispatch, RootState } from '@/store';
import { Product } from '@/types';
import { ProductCategory } from '@/types/ProductCategory';

export const useAddProduct = () => {
  // Accès au dispatch de Redux avec typage TS
  const dispatch = useDispatch<AppDispatch>();
  // Récupération du statut et erreur d'ajout depuis le store Redux
  const { addingProduct, addProductError } = useSelector((state: RootState) => state.products);

  // State local pour le formulaire, avec les champs nécessaires à l'ajout d'un produit
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

  // State local pour stocker l'URI de l'image sélectionnée (copiée localement)
  const [imageUri, setImageUri] = useState<string | null>(null);

  // State local pour stocker les erreurs de validation sur chaque champ (par clé du formulaire)
  const [errors, setErrors] = useState<Partial<Record<keyof AddProductFormInput, string>>>({});

  /**
   * Fonction de validation du formulaire via Zod
   * Valide tout le formulaire complet
   * En cas d'erreur, extrait les messages et met à jour le state des erreurs
   * Renvoie un objet indiquant succès ou erreurs pour gestion UI
   */
  const validateForm = useCallback((currentForm: AddProductFormInput) => {
    try {
      addProductSchema.parse(currentForm); // Valide via Zod
      setErrors({}); // Pas d'erreur => vide les erreurs
      return { success: true };
    } catch (e) {
      if (e instanceof ZodError) {
        const newErrors: Partial<Record<keyof AddProductFormInput, string>> = {};
        // Parcours chaque erreur et mappe sur le champ correspondant
        e.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as keyof AddProductFormInput] = err.message;
          }
        });
        setErrors(newErrors); // Mise à jour des erreurs dans le state
        return { success: false, errors: newErrors };
      }
      // Cas d'erreur inconnue, retourne sans erreurs spécifiques
      return { success: false, errors: {} };
    }
  }, []);

  /**
   * Réinitialise le formulaire à son état initial
   * Vide aussi l'image sélectionnée et valide à nouveau pour reset des erreurs
   */
  const resetForm = useCallback(() => {
    const initialFormState: AddProductFormInput = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      vendor: '',
      category: ProductCategory.OTHER,
      imageUrl: '',
      isActive: true,
    };
    setForm(initialFormState);
    setImageUri(null);
    validateForm(initialFormState);
  }, [validateForm]);

  // Effet qui valide automatiquement le formulaire à chaque modification des champs
  useEffect(() => {
    validateForm(form);
  }, [form, validateForm]);

  /**
   * Fonction de gestion de la modification d'un champ du formulaire
   * Met à jour le champ ciblé dans le state
   * Valide uniquement ce champ (via pick de Zod) pour afficher erreurs spécifiques immédiatement
   */
  const handleChange = useCallback((field: keyof AddProductFormInput, value: any) => {
    setForm(prevForm => {
      const updatedForm = { ...prevForm, [field]: value };

      try {
        // Valide uniquement le champ modifié
        addProductSchema.pick({ [field]: true } as never).parse({ [field]: value });
        setErrors(prevErrors => ({ ...prevErrors, [field]: undefined })); // Supprime erreur sur ce champ
      } catch (e) {
        if (e instanceof ZodError) {
          setErrors(prevErrors => ({ ...prevErrors, [field]: e.errors[0]?.message })); // Ajoute erreur sur ce champ
        }
      }

      return updatedForm;
    });
  }, []);

  /**
   * Fonction pour ouvrir la galerie photo et choisir une image
   * - Demande les permissions d'accès à la galerie
   * - Lance le sélecteur d'image avec options (images uniquement, édition possible, qualité)
   * - Si image choisie, copie localement dans documentDirectory d'Expo FS
   * - Met à jour l'URI de l'image dans le state local et dans le formulaire
   * - Gère les erreurs et permissions avec alertes utilisateur
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
        await FileSystem.copyAsync({ from: src, to: dst }); // Copie fichier dans le dossier privé de l'app
        setImageUri(dst);                                 // Met à jour l'URI de l'image
        handleChange('imageUrl', dst);                    // Met à jour le champ imageUrl du formulaire
      } catch (error) {
        console.error("Error copying image:", error);
        Alert.alert('Erreur', 'Impossible de copier l’image. Veuillez réessayer.');
      }
    }
  }, [handleChange]);

  /**
   * Fonction appelée à la soumission du formulaire
   * - Ferme le clavier
   * - Valide l'ensemble du formulaire (avec l'URI image à jour)
   * - En cas d'erreurs, affiche un message d'alerte
   * - Sinon, prépare le payload et déclenche l'action Redux asynchrone addNewProduct
   * - Selon le résultat, affiche succès ou erreur
   * - Gère aussi les erreurs inattendues (try/catch)
   */
  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();

    const validationResult = validateForm({ ...form, imageUrl: imageUri || '' });

    if (!validationResult.success) {
      Alert.alert('Validation', 'Veuillez corriger les erreurs dans le formulaire.');
      return { success: false, error: 'Validation failed', errors: validationResult.errors };
    }

    setErrors({}); // Clear errors before submission

    try {
      // Préparation du payload sans l'id (création)
      const payload: Omit<Product, 'id'> = {
        name: form.name,
        description: form.description as string,
        price: form.price,
        stock: form.stock,
        vendor: form.vendor,
        category: form.category as ProductCategory,
        imageUrl: imageUri || '',
        isActive: form.isActive,
      };

      // Dispatch action Redux d'ajout du produit
      const resultAction = await dispatch(addNewProduct(payload));

      if (addNewProduct.fulfilled.match(resultAction)) {
        Alert.alert('Succès', 'Produit ajouté avec succès !');
        return { success: true };
      } else {
        // Gestion des erreurs provenant du store ou payload
        const errorMessage = addProductError || (resultAction.payload as string) || 'Erreur inconnue lors de l\'ajout.';
        Alert.alert('Erreur', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur inattendue est survenue lors de l\'ajout du produit.');
      return { success: false, error: 'Unexpected error' };
    }
  }, [form, imageUri, dispatch, addProductError, validateForm]);

  // Retourne toutes les données et fonctions utiles au composant qui utilise ce hook
  return {
    form,           // Valeurs du formulaire (state)
    imageUri,       // URI locale de l'image sélectionnée
    errors,         // Erreurs de validation par champ
    addingProduct,  // Flag de chargement lors de l'ajout produit (depuis Redux)
    addProductError,// Erreur d'ajout provenant du store Redux
    handleChange,   // Gestionnaire pour changer un champ du formulaire
    pickImage,      // Fonction pour choisir une image dans la galerie
    handleSubmit,   // Fonction de soumission du formulaire
    resetForm,      // Fonction pour réinitialiser le formulaire
  };
};
