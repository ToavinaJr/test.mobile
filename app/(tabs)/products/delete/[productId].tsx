import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDeleteProduct } from '@/hooks/product/useDeleProduct';

const DeleteProductScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  const { product, loading, deleting, deleteError, handleDelete, deleteSuccess } = useDeleteProduct(productId);

  useEffect(() => {
    if (deleteSuccess) {
      router.replace('/');
    }
  }, [deleteSuccess, router]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black px-6">
        <Text className="text-lg text-gray-700 dark:text-gray-300 mb-6">Produit introuvable.</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-gray-300 dark:bg-gray-700 px-6 py-3 rounded-md"
          android_ripple={{ color: '#ddd' }}
        >
          <Text className="text-gray-800 dark:text-gray-100 font-semibold text-center">Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 py-10 justify-center">
      <Text className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Confirmer la suppression
      </Text>

      <Text className="text-center text-lg font-bold text-red-600 mb-12">
        {product.name}
      </Text>

      <Pressable
        onPress={handleDelete}
        disabled={deleting}
        className={`rounded-md py-4 mb-6 ${
          deleting ? 'bg-red-300' : 'bg-red-600 active:bg-red-700'
        }`}
        android_ripple={{ color: '#b91c1c' }}
      >
        <Text className="text-white font-semibold text-center text-lg">
          {deleting ? 'Suppression...' : 'Supprimer'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        disabled={deleting}
        className={`rounded-md py-4 border border-gray-400 dark:border-gray-600 ${
          deleting ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-black'
        }`}
        android_ripple={{ color: '#eee' }}
      >
        <Text className="text-gray-700 dark:text-gray-100 font-semibold text-center text-lg">Annuler</Text>
      </Pressable>

      {deleteError && (
        <Text className="text-red-500 text-center mt-4">{deleteError}</Text>
      )}
    </View>
  );
};

export default DeleteProductScreen;