import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDeleteProduct } from '@/hooks/product/useDeleProduct';

const DeleteProductScreen = () => {
  // Récupération des fonctions de navigation avec Expo Router
  const router = useRouter();

  // Récupération de l'ID du produit depuis les paramètres de l'URL
  const { productId } = useLocalSearchParams();

  // Hook personnalisé qui encapsule toute la logique de suppression
  const {
    product,         // Données du produit à supprimer (ou null si introuvable)
    loading,         // Indique que les données du produit sont en cours de chargement
    deleting,        // Indique que la suppression est en cours
    deleteError,     // Contient une erreur si la suppression échoue
    handleDelete,    // Fonction à appeler pour supprimer le produit
    deleteSuccess,   // Booléen : true si la suppression a réussi
  } = useDeleteProduct(productId);

  // Effet secondaire : redirige vers la page d’accueil si suppression réussie
  useEffect(() => {
    if (deleteSuccess) {
      router.replace('/'); // Redirection vers la page d’accueil après suppression
    }
  }, [deleteSuccess, router]);

  // Affichage pendant le chargement des données du produit
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  // Affichage si le produit est introuvable (mauvais ID ou supprimé)
  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black px-6">
        <Text className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Produit introuvable.
        </Text>

        {/* Bouton pour revenir en arrière */}
        <Pressable
          onPress={() => router.back()}
          className="bg-gray-300 dark:bg-gray-700 px-6 py-3 rounded-md"
          android_ripple={{ color: '#ddd' }}
        >
          <Text className="text-gray-800 dark:text-gray-100 font-semibold text-center">
            Retour
          </Text>
        </Pressable>
      </View>
    );
  }

  // Affichage principal : confirmation de suppression
  return (
    <View className="flex-1 bg-white dark:bg-black px-6 py-10 justify-center">
      {/* Titre principal */}
      <Text className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Confirmer la suppression
      </Text>

      {/* Nom du produit à supprimer, mis en valeur */}
      <Text className="text-center text-lg font-bold text-red-600 mb-12">
        {product.name}
      </Text>

      {/* Bouton de confirmation de suppression */}
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

      {/* Bouton d’annulation */}
      <Pressable
        onPress={() => router.back()}
        disabled={deleting}
        className={`rounded-md py-4 border border-gray-400 dark:border-gray-600 ${
          deleting ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-black'
        }`}
        android_ripple={{ color: '#eee' }}
      >
        <Text className="text-gray-700 dark:text-gray-100 font-semibold text-center text-lg">
          Annuler
        </Text>
      </Pressable>

      {/* Message d'erreur si la suppression échoue */}
      {deleteError && (
        <Text className="text-red-500 text-center mt-4">{deleteError}</Text>
      )}
    </View>
  );
};

export default DeleteProductScreen;
