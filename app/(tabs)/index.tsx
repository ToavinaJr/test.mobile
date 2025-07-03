import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  TextInput,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import ProductCard from '@/components/products/ProductCard';
import allProducts from '@/data/products.json';

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
  const { loading } = useAuthGuard();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => set.add(p.category ?? 'Autres'));
    return ['Tous', ...Array.from(set)];
  }, []);

  const handleSelectCategory = useCallback(
    (c: string) => {
      setCategory(c === 'Tous' ? null : c);
      Keyboard.dismiss();
    },
    []
  );

  const filtered = useMemo(
    () =>
      allProducts.filter((p) => {
        const matchCat = !category ? true : p.category === category;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [category, search]
  );

  if (loading) return <ActivityIndicator />;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black p-2">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard {...item} />}
        ListHeaderComponent={
          <ProductsHeader
            search={search}
            onChangeSearch={setSearch}
            categories={categories}
            selectedCategory={category}
            onSelectCategory={handleSelectCategory}
          />
        }
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
