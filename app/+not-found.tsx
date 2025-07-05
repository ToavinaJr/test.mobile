import React from 'react';
import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Introuvable' }} />

      <View className="flex-1 items-center justify-center p-8 bg-gray-100 dark:bg-zinc-950">
        <Ionicons name="alert-circle-outline" size={100} color="#ef4444" />

        <Text className="mt-4 text-6xl font-extrabold text-red-500 dark:text-red-400">
          404
        </Text>

        <Text className="mt-4 text-2xl font-bold text-center text-gray-800 dark:text-gray-50">
          Oups ! Page introuvable
        </Text>

        <Text className="mt-2 text-base text-center text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">
          Désolé, l'écran que vous recherchez n'existe pas ou a été déplacé.
          Veuillez vérifier l'URL ou retourner à la page d'accueil.
        </Text>

        <Link asChild href="/">
          <Text className="mt-8 px-10 py-4 rounded-full bg-indigo-600 text-white font-semibold text-lg shadow-lg">
            Retourner à l'accueil
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({});