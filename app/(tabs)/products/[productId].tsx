/**
 * ProductDetail
 * ---------------------------------------------------------------------------
 * Affiche le détail d’un produit.
 * - Récupère l’ID produit via l’URL.
 * - Charge les données via `useProductDetail`.
 * - Gère les états : chargement, produit introuvable, affichage normal.
 * - Propose des actions : retour, modifier, supprimer.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProductDetail } from '@/hooks/product/useProductDetail';

export default function ProductDetail() {
  // Navigation et récupération du paramètre :productId
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  // Hook métier : récupère le produit et l’état de chargement
  const { product, loading } = useProductDetail(productId);

  /* ----------------------------------------------------------------------- */
  /* Loader global                                                           */
  /* ----------------------------------------------------------------------- */
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* Produit introuvable                                                     */
  /* ----------------------------------------------------------------------- */
  if (!product) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50 dark:bg-black">
        <Text className="text-xl font-bold text-red-600 mb-1">
          Produit introuvable
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-300 text-center">
          L’ID <Text className="font-semibold">{productId}</Text> ne correspond
          à aucun article.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 rounded-xl bg-indigo-600"
        >
          <Text className="text-white">Retour</Text>
        </Pressable>
      </View>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* Détail du produit                                                       */
  /* ----------------------------------------------------------------------- */
  const {
    name,
    description,
    price,
    category,
    vendor,
    imageUrl,
    stock,
    isActive,
  } = product;

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-black"
      showsVerticalScrollIndicator={false}
    >
      {/* ------------------------------------------------------------------- */}
      {/* Image + Bouton retour + Badge indisponible                          */}
      {/* ------------------------------------------------------------------- */}
      <View className="relative">
        <Image source={{ uri: imageUrl }} className="w-full aspect-[4/3]" />

        {/* Badge “indisponible” si le produit est inactif */}
        {!isActive && (
          <View className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Text className="text-white font-bold text-lg">Indisponible</Text>
          </View>
        )}

        {/* Bouton retour */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/60"
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* ------------------------------------------------------------------- */}
      {/* Corps du détail                                                     */}
      {/* ------------------------------------------------------------------- */}
      <View className="p-4">
        {/* Catégorie */}
        <Text className="self-start mb-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          {category}
        </Text>

        {/* Nom + Prix */}
        <View className="flex-row justify-between items-start">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white flex-1 pr-4">
            {name}
          </Text>
          <Text className="text-2xl font-extrabold text-indigo-600">
            {price.toFixed(2)}€
          </Text>
        </View>

        {/* Vendeur */}
        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Vendu par{' '}
          <Text className="font-semibold bg-green-100 dark:bg-green-700 rounded-md px-3 py-1 text-green-800 dark:text-green-100">
            {vendor}
          </Text>
        </Text>

        {/* Stock */}
        <Text
          className={`mt-2 text-sm font-medium ${
            stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {stock > 0 ? `${stock} en stock` : 'Rupture de stock'}
        </Text>

        {/* Description */}
        <Text className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">
          {description}
        </Text>

        {/* ----------------------------------------------------------------- */}
        {/* Boutons actions (supprimer / modifier)                            */}
        {/* ----------------------------------------------------------------- */}
        <View className="flex-row justify-center gap-4 mt-6">
          {/* Supprimer */}
          <Pressable
            onPress={() => router.push(`/products/delete/${productId}`)}
            className="mt-6 w-[40%] py-2 px-4 rounded-xl flex-row items-center justify-center bg-red-600"
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text className="text-white font-medium ml-1">Supprimer</Text>
          </Pressable>

          {/* Modifier */}
          <Pressable
            onPress={() => router.push(`/products/edit/${productId}`)}
            className="mt-6 w-[40%] py-2 px-4 rounded-xl flex-row items-center justify-center bg-indigo-600"
          >
            <Ionicons name="pencil-outline" size={20} color="#fff" />
            <Text className="text-white font-medium ml-1">Modifier</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
