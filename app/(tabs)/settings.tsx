/**
 * SettingsScreen
 * -----------------------------------------------------------------------------
 * Écran des paramètres utilisateur avec options pour accéder au profil,
 * basculer entre mode clair/sombre, accéder à la liste des produits,
 * et se déconnecter.
 */

import React from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '@/services/auth-services';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/auth-context';

export default function SettingsScreen() {
  // Hook de navigation
  const router = useRouter();

  // Fonction de rafraîchissement du contexte auth (ex: mise à jour UI)
  const { refresh } = useAuth();

  // Récupération du thème actuel (clair/sombre) via hook custom
  const scheme = useColorScheme();

  // État local pour gérer la valeur du mode sombre (true = sombre)
  const [isDark, setIsDark] = React.useState(scheme === 'dark');

  /**
   * toggleTheme
   * -------------------------------------------------------------------------
   * Fonction pour inverser le mode sombre/claire localement.
   * TODO: à étendre pour appliquer globalement le thème (context, stockage, etc.)
   */
  const toggleTheme = () => {
    setIsDark((prev) => !prev);    
  };

  /**
   * Item
   * -------------------------------------------------------------------------
   * Composant réutilisable pour un élément de la liste des paramètres.
   * Affiche une icône, un label, et un élément à droite optionnel (ex: Switch).
   * Props :
   * - icon : nom de l'icône Ionicons
   * - label : texte affiché
   * - onPress : fonction appelée au clic
   * - right : élément React optionnel affiché à droite
   */
  const Item = ({
    icon,
    label,
    onPress,
    right,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    right?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center">
        {/* Icône à gauche */}
        <Ionicons
          name={icon}
          size={20}
          color={scheme === 'dark' ? '#fff' : '#000'}
        />
        {/* Label texte */}
        <Text className="ml-3 text-base text-gray-800 dark:text-gray-200">
          {label}
        </Text>
      </View>

      {/* Élément optionnel à droite (ex: switch) */}
      {right}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      {/* Titre de la page */}
      <Text className="text-xl font-bold px-4 py-3 text-gray-800 dark:text-gray-100">
        Paramètres
      </Text>

      {/* Conteneur des options paramètre */}
      <View className="mt-4 bg-white dark:bg-gray-800 rounded-xl mx-3 overflow-hidden shadow-sm">
        {/* Accès au profil */}
        <Item
          icon="person-circle-outline"
          label="Mon profil"
          onPress={() => router.push('/profil')}
        />

        {/* Bascule mode sombre */}
        <Item
          icon={isDark ? 'moon-outline' : 'sunny-outline'}
          label="Mode sombre"
          onPress={toggleTheme}
          right={<Switch value={isDark} onValueChange={toggleTheme} />}
        />

        {/* Accès à la liste des produits */}
        <Item
          icon="pricetags-outline"
          label="Liste des produits"
          onPress={() => router.push('/')}
        />

        {/* Déconnexion utilisateur */}
        <Item
          icon="log-out-outline"
          label="Déconnexion"
          onPress={async () => {
            await signOut();     // Appel service déconnexion
            await refresh();     // Rafraîchir contexte auth
            router.replace('/auth/sign-in'); // Redirection page login
          }}
        />
      </View>
    </SafeAreaView>
  );
}
