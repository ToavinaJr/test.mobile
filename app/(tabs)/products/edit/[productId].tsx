import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  ScrollView,
  Image,
} from 'react-native';
import {
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProductCategory } from '@/types/ProductCategory';
import InputTextCard from '@/components/ui/InputTextCard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useEditProduct } from '@/hooks/product/useEditProduct';

export default function ProductEditScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const {
    form,
    loading, // This is correctly destructured from useEditProduct
    errors,
    updatingProduct,
    updateProductError,
    handleChange,
    handleSubmit,
    hasChanges,
    resetForm,
    imageUri,
    pickImage,
  } = useEditProduct(productId);

  const handleSave = async () => {
    if (!hasChanges()) {
      Alert.alert('Info', 'Aucune modification détectée.');
      return;
    }
    const result = await handleSubmit();
    if (result.success) {
      router.replace(`/(tabs)/?refresh=${Date.now()}` as RelativePathString);
    }
  };

  const handleCancel = useCallback(() => {
    if (hasChanges()) {
      Alert.alert(
        'Annuler les modifications',
        'Voulez-vous vraiment annuler vos changements ?',
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui',
            style: 'destructive',
            onPress: () => {
              resetForm();
              Keyboard.dismiss();
              router.back();
            },
          },
        ],
      );
    } else {
      router.back();
    }
  }, [hasChanges, resetForm, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  const saveBtnClasses = updatingProduct ? 'bg-gray-400' : 'bg-indigo-600';

  return (
    <View style={{ flex: 1 }}>
      {updatingProduct && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4 text-base">Enregistrement...</Text>
        </View>
      )}
      {updateProductError && (
        <View style={styles.overlay}>
          <Text className="text-white text-center mb-4">{updateProductError}</Text>
          <Pressable onPress={() => { /* Handle retry or dismiss error */ }}>
            <Text className="text-white font-semibold">Réessayer</Text>
          </Pressable>
        </View>
      )}

      <KeyboardAwareScrollView
        className="flex-1 bg-gray-50 dark:bg-black p-4"
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={200}
        enableAutomaticScroll
        enableOnAndroid={true}
      >
        <View>
          <View className="flex-row items-center mb-6">
            <Pressable onPress={handleCancel} className="p-2 mr-2">
              <Ionicons name="arrow-back" size={20} color="#4f46e5" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Modifier le produit
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
            {errors.imageUrl && <Text className="text-red-500 text-sm mt-1">{errors.imageUrl}</Text>}
          </View>

          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Nom du produit</Text>
          <InputTextCard
            title="Nom"
            placeholder="Ex: T-shirt en coton"
            value={form.name}
            onChangeText={(v) => handleChange('name', v)}
            isValid={!errors.name}
            messageStatus={errors.name}
          />

          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1 mt-4">Description</Text>
          <InputTextCard
            title="Description"
            placeholder="Détails du produit..."
            value={form.description}
            onChangeText={(v) => handleChange('description', v)}
            isValid={!errors.description}
            messageStatus={errors.description}
            style="h-28"
          />

          <View className="flex-row gap-4 mt-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Prix (€)</Text>
              <InputTextCard
                title="Prix"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={form.price?.toString()}
                onChangeText={(v) => handleChange('price', parseFloat(v.replace(',', '.')) || 0)}
                isValid={!errors.price}
                messageStatus={errors.price}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">Stock</Text>
              <InputTextCard
                title="Stock"
                placeholder="0"
                keyboardType="numeric"
                value={form.stock?.toString()}
                onChangeText={(v) => handleChange('stock', parseInt(v, 10) || 0)}
                isValid={!errors.stock}
                messageStatus={errors.stock}
              />
            </View>
          </View>

          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1 mt-4">Vendeur</Text>
          <InputTextCard
            title="Vendeur"
            placeholder="Nom du vendeur"
            value={form.vendor}
            onChangeText={(v) => handleChange('vendor', v)}
            isValid={!errors.vendor}
            messageStatus={errors.vendor}
          />

          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1 mt-4">Catégorie</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 4, marginBottom: errors.category ? 0 : 24 }}
            className="py-2"
          >
            {Object.values(ProductCategory).map(cat => {
              const active = form.category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    handleChange('category', cat);
                    Keyboard.dismiss();
                  }}
                  className={`px-4 py-2 rounded-full mr-2 ${active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{cat}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {errors.category && <Text className="text-red-500 text-sm mb-6">{errors.category}</Text>}
          {!errors.category && <View className="h-6" />}

          <View className="flex-row justify-between items-center bg-white dark:bg-zinc-800 rounded-xl px-4 py-3 mt-4 mb-8 shadow-sm">
            <Text className="text-base text-gray-800 dark:text-gray-100 font-medium">Produit actif</Text>
            <Switch
              value={form.isActive}
              onValueChange={(v) => handleChange('isActive', v)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={form.isActive ? '#4f46e5' : '#f4f3f4'}
            />
          </View>

          <Pressable disabled={updatingProduct} onPress={handleSave} className={`py-4 rounded-xl items-center shadow-md ${saveBtnClasses}`}>
            <Text className="text-white font-semibold text-lg">{updatingProduct ? 'Enregistrement…' : 'Enregistrer les modifications'}</Text>
          </Pressable>

          <Pressable disabled={updatingProduct} onPress={handleCancel} className="py-4 mt-3 rounded-xl items-center border border-gray-300 dark:border-gray-600">
            <Text className="text-gray-800 dark:text-gray-100 font-semibold">Annuler</Text>
          </Pressable>

          <View className="h-20" />
        </View>
      </KeyboardAwareScrollView>
    </View>
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
