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
import { useProductDetail } from '@/hooks/useProductDetail';

export default function ProductDetail() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  const { product, loading } = useProductDetail(productId);

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator />
      </View>
    );

  if (!product)
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
      <View className="relative">
        <Image source={{ uri: imageUrl }} className="w-full aspect-[4/3]" />
        {!isActive && (
          <View className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Text className="text-white font-bold text-lg">Indisponible</Text>
          </View>
        )}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/60"
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
      </View>

      <View className="p-4">
        <Text className="self-start mb-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          {category}
        </Text>

        <View className="flex-row justify-between items-start">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white flex-1 pr-4">
            {name}
          </Text>
          <Text className="text-2xl font-extrabold text-indigo-600">
            {price.toFixed(2)}€
          </Text>
        </View>

        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Vendu par <Text className="font-semibold bg-green-100 dark:bg-green-700 rounded-md px-3 py-1 text-green-800 dark:text-green-100">{vendor}</Text>
        </Text>

        <Text
          className={`mt-2 text-sm font-medium ${
            stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {stock > 0 ? `${stock} en stock` : 'Rupture de stock'}
        </Text>

        <Text className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">
          {description}
        </Text>

        <View className='flex-row justify-center gap-4 mt-6'>
          <Pressable
            onPress={() => {
              router.push(`/products/delete/${productId}`);
              }
            }            
            className={`mt-6 w-[40%] py-2 px-4 rounded-xl justify-center items-center flex-row bg-red-600`}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text className="text-white font-medium ml-1">Supprimer</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              router.push(`/products/edit/${productId}`);
              }
            }
            className={`mt-6 py-2 px-4 w-[40%] rounded-xl justify-center items-center flex-row bg-indigo-600`}
          >
            <Ionicons name="pencil-outline" size={20} color="#fff" />
            <Text className="text-white font-medium ml-1">Modifier</Text>
          </Pressable>
        </View>
        
      </View>
    </ScrollView>
  );
}
