import React, { useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  TextInput,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
  StyleSheet
} from 'react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import ProductCard from '@/components/products/ProductCard';
import { router } from 'expo-router';
import FloatingAddButton from '@/components/products/FloatingAddButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useProducts } from '@/hooks/useProducts';

const ProductsHeader = React.memo(
  ({
    search,
    onChangeSearch,
    categories,
    selectedCategory,
    onSelectCategory,
  }: {
    search: string;
    onChangeSearch: (v: string) => void;
    categories: string[];
    selectedCategory: string | null;
    onSelectCategory: (c: string) => void;
  }) => (
    <View className="pb-4">
      <TextInput
        placeholder="Rechercher un produit..."
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={onChangeSearch}
        className="mb-3 rounded-2xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-base shadow-sm bg-white dark:bg-gray-800 text-black dark:text-white"
      />
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      >
        {categories.map((item) => {
          const active =
            (item === 'Tous' && !selectedCategory) || item === selectedCategory;
          return (
            <Pressable
              key={item}
              onPress={() => onSelectCategory(item)}
              className={`px-4 py-2 rounded-full ${
                active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? 'text-white' : 'text-gray-800 dark:text-gray-100'
                }`}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  )
);

export default function HomeScreen() {
  const { loading: authLoading } = useAuthGuard();

  const {
    loading: productsLoading,
    products,
    search,
    selectedCategory,
    categories,
    currentPage,
    totalPages,
    totalFilteredProducts,
    handleSearchChange,
    handleCategorySelect,
    handlePageChange,
  } = useProducts();

  if (authLoading || productsLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <View className="flex-row justify-center items-center mt-6 mb-8 px-4">
        <Pressable
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex-1 py-3 rounded-xl shadow-md ${
            currentPage === 1 ? 'bg-gray-300' : 'bg-indigo-600'
          } items-center`}
        >
          <Text className="text-white font-semibold text-base">Précédent</Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}
          className="max-w-[40%]" // Limit width for smaller screens
        >
          {pages.map((page) => (
            <Pressable
              key={page}
              onPress={() => handlePageChange(page)}
              className={`mx-1 px-4 py-2 rounded-full ${
                currentPage === page ? 'bg-indigo-800' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text className={`font-semibold text-sm ${currentPage === page ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                {page}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex-1 py-3 rounded-xl shadow-md ${
            currentPage === totalPages ? 'bg-gray-300' : 'bg-indigo-600'
          } items-center`}
        >
          <Text className="text-white font-semibold text-base">Suivant</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View className="flex-1 bg-gray-50 dark:bg-black p-2">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onShow={() => {
              router.push(`/products/${item.id}`);
            }}
            onDelete={() =>  {
              if (!item.isActive) return;
              router.push(`/products/delete/${item.id}`);
            }}
            onEdit={() => {
              if (!item.isActive) return;
              router.push(`/products/edit/${item.id}`)}}
          />
        )}
        ListHeaderComponent={
          <ProductsHeader
            search={search}
            onChangeSearch={handleSearchChange}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        }
        ListFooterComponent={renderPagination()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !productsLoading && totalFilteredProducts === 0 ? (
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-gray-600 dark:text-gray-400 text-lg">
                Aucun produit trouvé.
              </Text>
            </View>
          ) : null
        }
      />

      <FloatingAddButton />
    </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
});
