/**
 * ProfilScreen
 * ---------------------------------------------------------------------------
 * Écran affichant les informations du profil utilisateur connecté.
 * - Récupère les données utilisateur via un hook personnalisé useProfile.
 * - Affiche loader pendant la récupération.
 * - Affiche une erreur si impossible de charger le profil.
 * - Permet d’accéder à la modification du profil et à la liste des produits.
 * - Offre une fonctionnalité de déconnexion.
 */

import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '@/services/auth-services';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useProfile } from '@/hooks/profil/useProfile';

export default function ProfilScreen() {
  // Accès à la navigation avec Expo Router
  const router = useRouter();

  // Contexte d’authentification pour forcer le rafraîchissement après déconnexion
  const { refresh } = useAuth();

  // Hook personnalisé pour récupérer l’utilisateur et l’état de chargement
  const { user, loading } = useProfile();

  // Affichage d’un loader pendant la récupération des données utilisateur
  if (loading)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );

  // Gestion du cas où aucun utilisateur n’est récupéré (erreur ou session expirée)
  if (!user)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-950">
        <Text className="text-lg text-gray-600 dark:text-gray-300">
          Impossible de charger le profil.
        </Text>
      </SafeAreaView>
    );

  // Extraction de la première lettre du nom pour affichage en avatar
  const initial = user.name?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-zinc-950">
      {/* Configuration de la barre de statut pour harmoniser le design */}
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" animated />

      {/* Section avatar + nom + email */}
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

      {/* Menu des actions disponibles */}
      <View className="flex-1 px-4">
        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-md space-y-3">
          {/* Item pour modifier le profil */}
          <ListItem
            icon="create-outline"
            label="Modifier le profil"
            onPress={() => router.push('/profil/edit')}
          />

          {/* Item pour accéder à la liste des produits */}
          <ListItem
            icon="cube-outline"
            label="Mes produits"
            onPress={() => router.push('/')}
          />
        </View>

        {/* Bouton déconnexion */}
        <Pressable
          onPress={async () => {
            await signOut();    // Appel du service de déconnexion
            await refresh();    // Rafraîchissement du contexte d’authentification
            router.replace('/auth/sign-in'); // Redirection vers la page de connexion
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

/**
 * ListItem
 * ---------------------------------------------------------------------------
 * Composant réutilisable pour un item de liste cliquable avec icône.
 * Props :
 * - icon : nom de l’icône Ionicons.
 * - label : texte affiché.
 * - onPress : callback quand l’item est pressé.
 * - containerCls : classes supplémentaires CSS Tailwind pour le container.
 * - labelCls : classes CSS pour le label.
 * - iconColor : couleur de l’icône.
 */
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
