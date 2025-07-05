/**
 * TabsLayout & CustomHeader
 * ---------------------------------------------------------------------------
 * Configuration des onglets principaux de l'application avec navigation
 * - Vérifie l'authentification via le contexte useAuth avant de rendre les onglets
 * - Redirige vers la page de connexion si pas d'utilisateur connecté (token manquant)
 * - Personnalise le header pour chaque écran avec un titre dynamique et boutons retour & paramètres
 * - Utilise Expo Router pour gérer la navigation et l'historique
 */

import { Redirect, router, Tabs } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  Text,
  useColorScheme,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * CustomHeader
 * ---------------------------------------------------------------------------
 * Header personnalisé affichant :
 * - Bouton "retour" si la navigation peut reculer
 * - Titre centré dynamique selon l'écran
 * - Bouton "paramètres" à droite
 * 
 * Props :
 * - title : titre à afficher dans le header
 * - navigation : objet navigation (non utilisé ici mais reçu)
 */
function CustomHeader({
  title,
}: {
  title: string;
  navigation: any;
}) {
  // Détection du thème (clair/sombre) pour adapter le style du header
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? 'dark' : 'light';

  // Couleur des icônes selon le thème
  const iconColor = tint === 'dark' ? '#fff' : '#000';

  // Style principal du header (flex row, padding, bordure)
  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 6 : 12,
    borderBottomWidth: 0.4,
    borderColor: tint === 'dark' ? '#444' : '#ccc',
  };

  return (
    <BlurView tint={tint} intensity={90} style={headerStyle}>
      {/* Bouton retour si possible */}
      {
        router.canGoBack() &&
        <Pressable
          onPress={() => {
            router.canGoBack() ? router.back() : null;
          }}
          hitSlop={8} // zone tactile élargie pour confort d'utilisation
        >
          <Ionicons name="arrow-back-outline" size={24} color={iconColor} />
        </Pressable>
      }

      {/* Titre centré dans le header */}
      <Text
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'SpaceMono',
          fontSize: 18,
          color: iconColor,
        }}
      >
        {title}
      </Text>

      {/* Bouton paramètres à droite */}
      <Pressable
        onPress={async () => {
          router.push('/settings');
        }}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={24} color={iconColor} />
      </Pressable>
    </BlurView>
  );
}

/**
 * TabsLayout
 * ---------------------------------------------------------------------------
 * Point d’entrée des onglets principaux de l’application
 * - Vérifie si utilisateur est connecté (token présent)
 * - Affiche loader pendant chargement de l’auth
 * - Redirige vers page connexion si pas connecté
 * - Configure les écrans d’onglets avec titres, icônes, et header personnalisé
 */
export default function TabsLayout() {
  // Récupération du token et du statut loading via le contexte d'authentification
  const { token, loading } = useAuth();

  // Ne rien afficher tant que la vérification est en cours
  if (loading) return null;

  // Si utilisateur non connecté, redirection vers la page de connexion
  if (!token) return <Redirect href="/auth/sign-in" />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route, navigation }) => ({
          // Personnalisation du header selon l'écran courant
          header: () => (
            <CustomHeader
              title={
                route.name === 'index'
                  ? 'Accueil'
                  : route.name === 'settings'
                  ? 'Paramètres'
                  : route.name === 'profil/index'
                  ? 'Profil'
                  : route.name === 'profil/edit/index'
                  ? 'Éditer le profil'
                  : route.name === 'products/edit/[productId]'
                  ? 'Éditer le produit'
                  : route.name === 'products/add/index'
                  ? 'Ajout de produit'
                  : route.name === 'products/[productId]'
                  ? 'Détails du produit'
                  : 'Chargement...'
              }
              navigation={route} // transmis pour compatibilité future
            />
          ),
          tabBarActiveTintColor: '#4f46e5',  // Couleur icône active
          tabBarInactiveTintColor: '#9ca3af', // Couleur icône inactive
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: 'rgba(255,255,255,0.9)', // Fond translucide
          },
        })}
      >
        {/* Onglet Accueil */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />

        {/* Onglet Profil */}
        <Tabs.Screen
          name="profil/index"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />

        {/* Écran modification profil (pas dans tabBar) */}
        <Tabs.Screen
          name="profil/edit/index"
          options={{ href: null, title: 'Éditer le profil' }}
        />

        {/* Paramètres (pas dans tabBar) */}
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            title: 'Paramètres',
          }}
        />

        {/* Écran détails produit (pas dans tabBar) */}
        <Tabs.Screen
          name="products/[productId]"
          options={{ href: null, title: "Détails du produit" }}
        />

        {/* Écran édition produit (pas dans tabBar) */}
        <Tabs.Screen
          name="products/edit/[productId]"
          options={{ href: null, title: 'Éditer le produit' }}
        />

        {/* Écran suppression produit (pas dans tabBar) */}
        <Tabs.Screen
          name="products/delete/[productId]"
          options={{ href: null, title: 'Suppression produit' }}
        />

        {/* Écran ajout produit (pas dans tabBar) */}
        <Tabs.Screen
          name="products/add/index"
          options={{ href: null, title: 'Ajout de produit' }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
