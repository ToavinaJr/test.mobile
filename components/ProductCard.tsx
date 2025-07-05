import { View, Text, Image, Pressable } from 'react-native';
import React from 'react';
import { Product, ProductCategory } from '@/types';
import { Feather, Ionicons } from '@expo/vector-icons';

type ProductCardProps = {
  product: Product;
  onShow?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const categoryColors: Record<ProductCategory, string> = {
  [ProductCategory.ELECTRONICS]: 'bg-blue-500',
  [ProductCategory.CLOTHING]: 'bg-purple-500',
  [ProductCategory.HOME_APPLIANCES]: 'bg-green-500',
  [ProductCategory.BOOKS]: 'bg-red-500',
  [ProductCategory.SPORTS]: 'bg-indigo-500',
  [ProductCategory.FOOD]: 'bg-yellow-500',
  [ProductCategory.BEAUTY]: 'bg-pink-500',
  [ProductCategory.TOYS]: 'bg-teal-500',
  [ProductCategory.AUTOMOTIVE]: 'bg-gray-500',
  [ProductCategory.HEALTH]: 'bg-lime-500',
  [ProductCategory.FURNITURE]: 'bg-orange-500',
  [ProductCategory.OTHER]: 'bg-neutral-500',
};

const ProductCard = ({
  product,
  onShow,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  const { name, description, price, imageUrl, category, isActive } = product;

  const categoryColorClass = categoryColors[category] || 'bg-gray-500';

  return (
    <Pressable onPress={onShow} className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mx-1 mb-2">
      <View className="relative">
        <Image source={{ uri: imageUrl }} className="w-full aspect-[4/3]" />
        {!isActive && (
          <View className="absolute inset-0 bg-black/60 flex justify-center items-center">
            <Text className="text-white font-bold">Rupture de stock</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className={`text-xs text-white font-semibold rounded-full px-2 py-1 self-start ${categoryColorClass}`}>
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
              disabled={!isActive}
              onPress={onEdit}
              className={`p-2 rounded-full  active:opacity-80 bg-amber-500`}
            >
              <Feather name="edit-2" size={16} color="#fff" />
            </Pressable>

            <Pressable
              disabled={!isActive}
              onPress={onDelete}
              className={`p-2 rounded-full  active:opacity-80 bg-[#4f46e5]`}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ProductCard;