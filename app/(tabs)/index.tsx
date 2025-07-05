// app/(tabs)/index.tsx
import React from 'react';
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
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import ProductCard from '@/components/products/ProductCard';
import { router } from 'expo-router';
import FloatingAddButton from '@/components/products/FloatingButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useProducts } from '@/hooks/product/useProducts';
import { Ionicons } from '@expo/vector-icons';
import PaginationButton from '@/components/ui/PaginationButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
      <View className="flex-row items-center justify-center my-6 px-3">
        {/* ◀ Précédent */}
        
        <PaginationButton
          label="◀"
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          compact
        />
  
        {/* Pages */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
          className="flex-grow px-2"
        >
          {pages.map((page) => (
            <PaginationButton
              key={page}
              label={page}
              onPress={() => handlePageChange(page)}
              active={page === currentPage}
            />
          ))}
        </ScrollView>
  
        {/* ▶ Suivant */}
        <PaginationButton
          label="▶"
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          compact
        />
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
              router.push(`/products/delete/${item.id}`);
            }}
            onEdit={() => {
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

      <FloatingAddButton>
        <Ionicons.Button
            name="add"
            backgroundColor="#4f46e5"
            borderRadius={9999}
            size={40}
            onPress={() => router.push('/products/add')}
            iconStyle={{ marginRight: 0 }}
          />
      </FloatingAddButton>
    </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
});
