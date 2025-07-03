import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
  StyleSheet,
} from 'react-native';
import { router, RelativePathString } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

import { addProduct, invalidateProductsCache } from '@/services/products.services';
import { Product } from '@/types';

const sanitize = (s: string) => s.trim();

export default function ProductAddScreen() {
  const [name, setName] = useState('');
  const [description, setDesc] = useState('');
  const [priceStr, setPrice] = useState('');
  const [stockStr, setStock] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCat] = useState('');
  const [isActive, setActive] = useState(true);
  const [imageUri, setUri] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
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
        setUri(dst);
      } catch (error) {
        console.error("Error copying image:", error);
        Alert.alert('Erreur', 'Impossible de copier l’image. Veuillez réessayer.');
      }
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    requestAnimationFrame(runSave);
  };

  const runSave = async () => {
    if (!sanitize(name)) {
      Alert.alert('Validation', 'Le nom du produit est obligatoire.');
      return;
    }
    const price = parseFloat(priceStr.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Validation', 'Le prix doit être un nombre positif valide.');
      return;
    }
    const stock = parseInt(stockStr, 10) || 0;
    if (!imageUri) {
      Alert.alert('Validation', 'Veuillez sélectionner une image pour le produit.');
      return;
    }

    const payload: Omit<Product, 'id'> = {
      name: sanitize(name),
      description: sanitize(description),
      price,
      stock,
      vendor: sanitize(vendor),
      category: sanitize(category),
      imageUrl: imageUri,
      isActive,
    };

    setSaving(true);
    try {
      await addProduct(payload);
      invalidateProductsCache();
      Alert.alert('Succès', 'Produit ajouté avec succès !', [
        {
          text: 'OK',
          onPress: () =>
            router.replace(`/(tabs)/?refresh=${Date.now()}` as RelativePathString),
        },
      ]);
    } catch (e) {
      console.error("Error adding product:", e);
      Alert.alert('Erreur', 'Impossible d’enregistrer le produit. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const saveButtonClasses = saving
    ? 'bg-gray-400'
    : 'bg-indigo-600';

  return (
    <>
      {saving && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4 text-base">Enregistrement...</Text>
        </View>
      )}

      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-zinc-900 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Ionicons name="arrow-back" size={20} color="#4f46e5" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Ajouter un produit
          </Text>
        </View>

        <View className="items-center mb-6">
          <Pressable
            onPress={pickImage}
            className="w-48 h-48 rounded-2xl border-2 border-indigo-300 dark:border-indigo-600 bg-gray-200 dark:bg-zinc-800 justify-center items-center overflow-hidden shadow-md"
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-full object-cover" />
            ) : (
              <Ionicons name="camera" size={60} color="#6366f1" />
            )}
          </Pressable>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Appuyez pour sélectionner une image
          </Text>
        </View>

        <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Nom du produit</Text>
        <TextInput
          placeholder="Ex: T-shirt en coton"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
          className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 mb-4 text-gray-800 dark:text-gray-100 text-base"
        />

        <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Description</Text>
        <TextInput
          placeholder="Détails du produit..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDesc}
          multiline
          numberOfLines={4}
          className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 h-28 mb-4 text-gray-800 dark:text-gray-100 text-base"
        />

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Prix (€)</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={priceStr}
              onChangeText={setPrice}
              className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 text-base"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Stock</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={stockStr}
              onChangeText={setStock}
              className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 text-base"
            />
          </View>
        </View>

        <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Vendeur</Text>
        <TextInput
          placeholder="Nom du vendeur"
          placeholderTextColor="#9ca3af"
          value={vendor}
          onChangeText={setVendor}
          className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 mb-4 text-gray-800 dark:text-gray-100 text-base"
        />

        <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Catégorie</Text>
        <TextInput
          placeholder="Ex: Vêtements, Électronique"
          placeholderTextColor="#9ca3af"
          value={category}
          onChangeText={setCat}
          className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 mb-6 text-gray-800 dark:text-gray-100 text-base"
        />

        <View className="flex-row justify-between items-center bg-white dark:bg-zinc-800 rounded-xl px-4 py-3 mb-8 shadow-sm">
          <Text className="text-base text-gray-800 dark:text-gray-100 font-medium">
            Produit actif
          </Text>
          <Switch
            value={isActive}
            onValueChange={setActive}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isActive ? '#4f46e5' : '#f4f3f4'}
          />
        </View>

        <Pressable
          disabled={saving}
          onPress={handleSave}
          className={`py-4 rounded-xl items-center shadow-md ${saveButtonClasses}`}
        >
          <Text className="text-white font-semibold text-lg">
            {saving ? 'Enregistrement en cours...' : 'Enregistrer le produit'}
          </Text>
        </Pressable>

        <View className="h-20" />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});