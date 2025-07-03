import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getUserDetails, signOut } from '@/services/auth.services';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function ProfilScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const details = await getUserDetails();
        if (isActive) {
          setUser(details);
          setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );

  if (!user)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-950">
        <Text className="text-lg text-gray-600 dark:text-gray-300">
          Impossible de charger le profil.
        </Text>
      </SafeAreaView>
    );

  const initial = user.name?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-zinc-950">
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" animated />

      <View className="items-center mt-12 mb-8 px-6">
        <View className="w-32 h-32 rounded-full bg-indigo-600 items-center justify-center shadow-lg border-2 border-white dark:border-zinc-800">
          <Text className="text-white text-5xl font-extrabold">{initial}</Text>
        </View>

        <Text className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          {user.name}
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-400">
          {user.email}
        </Text>
      </View>

      <View className="flex-1 px-4">
        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-md space-y-3">
          <ListItem
            icon="create-outline"
            label="Modifier le profil"
            onPress={() => router.push('/profil/edit')}
          />

          <ListItem
            icon="cube-outline"
            label="Mes produits"
            onPress={() => router.push('/')}
          />
        </View>

        <Pressable
          onPress={async () => {
            await signOut();
            await refresh();
            router.replace('/auth/sign-in');
          }}
          className="mt-6 flex-row items-center justify-center px-5 py-4 rounded-2xl bg-red-500 shadow-md"
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text className="ml-3 text-white text-base font-semibold">Déconnexion</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ListItem({
  icon,
  label,
  onPress,
  containerCls = '',
  labelCls = 'text-gray-800 dark:text-gray-200',
  iconColor = '#4f46e5',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  containerCls?: string;
  labelCls?: string;
  iconColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-3 rounded-xl ${containerCls}`}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text className={`ml-4 text-base ${labelCls}`}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
    </Pressable>
  );
}