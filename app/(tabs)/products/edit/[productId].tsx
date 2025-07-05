import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from 'react-native';
import {
  RelativePathString,
  Stack,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import {
  getProductById,
  updateProductById,
  invalidateProductsCache,
} from '@/services/products.services';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { ProductCategory } from '@/types/ProductCategory';

/* ------------------------------------------------------------------ */
/* Overlay visuel pendant la sauvegarde                               */
/* ------------------------------------------------------------------ */
const SavingOverlay = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" />
  </View>
);

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */
const sanitize = (str: string) => str.trim();

/**
 * Compare seulement les clés réellement présentes dans `b`
 * (celles que l’on va envoyer au backend).
 */
const shallowEqual = (a: Partial<Product>, b: Partial<Product>) => {
  for (const k of Object.keys(b) as (keyof Product)[]) {
    if (a[k] !== b[k]) return false;
  }
  return true;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function ProductEditScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  /* ------------------------ UX ------------------------ */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* --------------------- formulaires ------------------ */
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [stockStr, setStockStr] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  /* ------------------- produit original -------------- */
  const originalRef = useRef<Product | null>(null);

  /* ------------------- chargement --------------------- */
  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        const p = await getProductById(productId);
        if (!p) throw new Error('Produit introuvable');

        originalRef.current = p;

        setName(p.name);
        setDescription(p.description ?? '');
        setPriceStr(String(p.price ?? ''));
        setStockStr(String(p.stock ?? ''));
        setCategory(p.category ?? '');
        setVendor(p.vendor ?? '');          // <-- vendor propre
        setImageUrl(p.imageUrl ?? '');
        setIsActive(p.isActive ?? true);
      } catch (err) {
        Alert.alert('Erreur', (err as Error).message, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  /* ------------------- sauvegarde --------------------- */
  const handleSave = async () => {
    if (!productId) return;

    Keyboard.dismiss();

    /* validation simple */
    if (!sanitize(name)) {
      Alert.alert('Validation', 'Le nom est obligatoire.');
      return;
    }

    const price = parseFloat(priceStr.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Validation', 'Le prix doit être un nombre positif.');
      return;
    }

    const stock = parseInt(stockStr, 10) || 0;

    /* construction du payload */
    const payload: Partial<Product> = {
      name: sanitize(name),
      description: sanitize(description),
      price,
      stock,
      category: category as ProductCategory,
      vendor: sanitize(vendor),
      imageUrl: sanitize(imageUrl),
      isActive,
    };

    /* si rien n'a changé, avertir et sortir */
    if (originalRef.current && shallowEqual(originalRef.current, payload)) {
      Alert.alert('Info', 'Aucune modification détectée.');
      return;
    }

    setSaving(true);
    try {
      await updateProductById(productId, payload);
      invalidateProductsCache();

      Alert.alert('Succès', 'Produit enregistré avec succès.', [
        {
          text: 'OK',
          onPress: () =>
            router.replace(`/(tabs)/?refresh=${Date.now()}` as RelativePathString),
        },
      ]);
    } catch (err) {
      console.error('updateProduct error →', err);
      Alert.alert(
        'Erreur',
        'Impossible d’enregistrer le produit. Veuillez réessayer.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* --------------------- UI --------------------------- */
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      
      {saving && <SavingOverlay />}
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-black p-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nom */}
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nom</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="mb-4 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
        />

        {/* Description */}
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          className="mb-4 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
        />

        {/* Prix & Stock */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Prix (€)
            </Text>
            <TextInput
              keyboardType="decimal-pad"
              value={priceStr}
              onChangeText={setPriceStr}
              className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Stock
            </Text>
            <TextInput
              keyboardType="number-pad"
              value={stockStr}
              onChangeText={setStockStr}
              className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
            />
          </View>
        </View>

        {/* Catégorie */}
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Catégorie
        </Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          className="mb-4 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
        />

        {/* Vendeur */}
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Vendeur
        </Text>
        <TextInput
          value={vendor}
          onChangeText={setVendor}
          className="mb-4 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
        />

        {/* Image URL */}
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Image URL
        </Text>
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          className="mb-4 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
        />

        {/* Actif */}
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-base text-gray-800 dark:text-gray-100">
            Actif
          </Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        {/* bouton SAVE */}
        <Pressable
          disabled={saving}
          onPress={handleSave}
          className={`items-center py-4 rounded-xl ${
            saving ? 'bg-gray-400' : 'bg-indigo-600'
          }`}
        >
          <Text className="text-white font-semibold">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
