import { Redirect, router, Tabs } from 'expo-router';
import { useAuth } from '@/context/auth-context'; // This context will now read from Redux
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


function CustomHeader({
  title,
}: {
  title: string;
  navigation: any;
}) {
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? 'dark' : 'light';

  const iconColor = tint === 'dark' ? '#fff' : '#000';

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
      {
        router.canGoBack() &&
        <Pressable
          onPress={() => {
            router.canGoBack() ? router.back() : null;
          }}
          hitSlop={8}
        >
          <Ionicons name="arrow-back-outline" size={24} color={iconColor} />
        </Pressable>
      }
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

      <Pressable
        onPress={async () => {
          router.push('/settings')
        }}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={24} color={iconColor} />
      </Pressable>
    </BlurView>
  );
}

export default function TabsLayout() {
  const { token, loading } = useAuth();

  if (loading) return null;
  if (!token) return <Redirect href="/auth/sign-in" />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route, navigation }) => ({
          header: () => (
            <CustomHeader
              title={
                route.name === 'index'
                  ? 'Accueil'
                  : route.name === 'settings'
                  ? 'Paramètres'
                  : route.name === 'profil/index' // Corrected for profil/index
                  ? 'Profil'
                  : route.name === 'profil/edit/index'
                  ? 'Éditer le profil'
                  : route.name === 'products/edit/[productId]'
                  ? 'Éditer le produit'
                  : route.name === 'products/add/index'
                  ? 'Ajout de produit'
                  : route.name === 'products/[productId]'
                  ? 'Détails du produit'
                  : 'Chargement...' // Default for unexpected route.name
              }
              navigation={route}
            />
          ),
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: 'rgba(255,255,255,0.9)',
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profil/index"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profil/edit/index"
          options={{ href: null, title: 'Éditer le profil' }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            title: 'Paramètres',
          }}
        />
        <Tabs.Screen
          name="products/[productId]"
          options={{ href: null, title: "Détails du produit" }} // Changed title
        />
        <Tabs.Screen
          name="products/edit/[productId]"
          options={{ href: null, title: 'Éditer le produit' }}
        />
        <Tabs.Screen
          name="products/delete/[productId]"
          options={{ href: null, title: 'Suppression produit' }} // Changed title
        />
        <Tabs.Screen
          name="products/add/index"
          options={{ href: null, title: 'Ajout de produit' }}
        />
      </Tabs>
    </SafeAreaView>
  );
}