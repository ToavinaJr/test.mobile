// components/products/ProductCard.tsx
import { View, Text, Image, Pressable } from 'react-native';
import React from 'react';
import { Product } from '@/types';
import { Ionicons, Feather } from '@expo/vector-icons'; // expo install @expo/vector-icons

const ProductCard = ({
  id,
  name,
  description,
  price,
  category,
  imageUrl,
  isActive,
}: Product) => {
  const handleEdit = () => console.log(`Édition du produit #${id}`);
  const handleDelete = () => console.log(`Suppression du produit #${id}`);

  return (
    <View className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mx-1 mb-2">
      <View className="relative">
        <Image source={{ uri: imageUrl }} className="w-full aspect-[4/3]" />
        {!isActive && (
          <View className="absolute inset-0 bg-black/60 flex justify-center items-center">
            <Text className="text-white font-bold">Rupture de stock</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-xs text-blue-800 font-semibold bg-blue-100 rounded-full px-2 py-1 self-start">
          {category}
        </Text>

        <Text
          className="text-base font-bold text-gray-800 mt-2"
          numberOfLines={1}
        >
          {name}
        </Text>

        <Text className="text-xs text-gray-600 mt-1" numberOfLines={1}>
          {description}
        </Text>

        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-lg font-extrabold text-slate-800">
            {price.toFixed(2)}€
          </Text>

          <View className="flex-row space-x-3 gap-2">
            <Pressable
              onPress={handleEdit}
              className="p-2 rounded-full bg-amber-500 active:opacity-80 mr-1"
            >
              <Feather name="edit-2" size={16} color="#fff" />
            </Pressable>

            <Pressable
              onPress={handleDelete}
              className="p-2 rounded-full bg-red-600 active:opacity-80"
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
