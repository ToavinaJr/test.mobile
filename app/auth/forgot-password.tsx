import React from 'react';
import { router } from 'expo-router';
import { SafeAreaView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native'; 

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-slate-900 px-6">
      <View className="w-full max-w-xl items-center">
        <Ionicons
          name="lock-open-outline"
          size={84}
          color="#6366f1"
          className="mb-6"
        />

        <Text className="text-center text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Mot de passe oublié ?
        </Text>

        <Text className="text-base leading-relaxed text-center text-slate-600 dark:text-slate-300 mb-4">
          Nous travaillons actuellement sur la fonctionnalité de réinitialisation
          de mot de passe. Veuillez nous excuser pour la gêne occasionnée.
        </Text>

        <Text className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
          Contactez le support si vous avez besoin d’aide immédiate.
        </Text>

        <Pressable
          className="w-full rounded-xl bg-indigo-600 py-3 mb-3 active:opacity-80"
          onPress={() => router.replace('/auth/sign-in')}
        >
          <Text className="text-center text-white font-medium">Retour à la connexion</Text>
        </Pressable>

        <Pressable
          className="w-full rounded-xl border border-indigo-600 py-3 active:opacity-80"
          onPress={() => router.replace('/auth/sign-up')}
        >
          <Text className="text-center text-indigo-600 font-medium">S’inscrire</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}