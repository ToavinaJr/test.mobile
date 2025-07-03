// import React, { useEffect, useState } from 'react';
// import { View, Text, Alert, ActivityIndicator, Pressable } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { getProductById, deleteProductById } from '@/services/products.services';
// import { Product } from '@/types';

// const DeleteProductScreen = () => {
//   const router = useRouter();
//   const { productId } = useLocalSearchParams();

//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     if (!productId) return;
//     getProductById(productId as string)
//       .then(setProduct)
//       .finally(() => setLoading(false));
//   }, [productId]);

//   const handleDelete = async () => {
//     if (!product) return;

//     setDeleting(true);
//     try {
//       await deleteProductById(product.id);
//       Alert.alert('Succès', `Le produit "${product.name}" a été supprimé.`);
//       router.replace('/'); // adapte la route si besoin
//     } catch (error) {
//       Alert.alert('Erreur', 'Impossible de supprimer le produit.');
//       console.error(error);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="#ef4444" /> 
//       </View>
//     );
//   }

//   if (!product) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white px-6">
//         <Text className="text-lg text-gray-700 mb-6">Produit introuvable.</Text>
//         <Pressable
//           onPress={() => router.back()}
//           className="bg-gray-300 px-6 py-3 rounded-md"
//           android_ripple={{ color: '#ddd' }}
//         >
//           <Text className="text-gray-800 font-semibold text-center">Retour</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white px-6 py-10 justify-center">
//       <Text className="text-2xl font-semibold text-gray-900 mb-4 text-center">
//         Confirmer la suppression
//       </Text>

//       <Text className="text-center text-lg font-bold text-red-600 mb-12">
//         {product.name}
//       </Text>

//       <Pressable
//         onPress={handleDelete}
//         disabled={deleting}
//         className={`rounded-md py-4 mb-6 ${
//           deleting ? 'bg-red-300' : 'bg-red-600'
//         }`}
//         android_ripple={{ color: '#b91c1c' }}
//       >
//         <Text className="text-white font-semibold text-center text-lg">
//           {deleting ? 'Suppression...' : 'Supprimer'}
//         </Text>
//       </Pressable>

//       <Pressable
//         onPress={() => router.back()}
//         disabled={deleting}
//         className={`rounded-md py-4 border border-gray-400 ${
//           deleting ? 'bg-gray-200' : 'bg-white'
//         }`}
//         android_ripple={{ color: '#eee' }}
//       >
//         <Text className="text-gray-700 font-semibold text-center text-lg">Annuler</Text>
//       </Pressable>
//     </View>
//   );
// };

// export default DeleteProductScreen;


import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getProductById, deleteProductById } from '@/services/products.services';
import { Product } from '@/types';

const DeleteProductScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    getProductById(productId as string)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;

    setDeleting(true);
    try {
      await deleteProductById(product.id);
      Alert.alert('Succès', `Le produit "${product.name}" a été supprimé.`);
      router.replace(`/?refresh=${Date.now()}`); // Force le refresh dans HomeScreen
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le produit.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-lg text-gray-700 mb-6">Produit introuvable.</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-gray-300 px-6 py-3 rounded-md"
          android_ripple={{ color: '#ddd' }}
        >
          <Text className="text-gray-800 font-semibold text-center">Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 py-10 justify-center">
      <Text className="text-2xl font-semibold text-gray-900 mb-4 text-center">
        Confirmer la suppression
      </Text>

      <Text className="text-center text-lg font-bold text-red-600 mb-12">
        {product.name}
      </Text>

      <Pressable
        onPress={handleDelete}
        disabled={deleting}
        className={`rounded-md py-4 mb-6 ${
          deleting ? 'bg-red-300' : 'bg-red-600'
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
        className={`rounded-md py-4 border border-gray-400 ${
          deleting ? 'bg-gray-200' : 'bg-white'
        }`}
        android_ripple={{ color: '#eee' }}
      >
        <Text className="text-gray-700 font-semibold text-center text-lg">Annuler</Text>
      </Pressable>
    </View>
  );
};

export default DeleteProductScreen;
