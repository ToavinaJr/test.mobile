<<<<<<< HEAD
// apps/(tabs)/_layout.tsx
=======
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
import { Redirect, router, Tabs } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD
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
=======
import { Pressable, Text, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from '@/services/auth.services';

function CustomHeader({ title, navigation }: { title: string; navigation: any }) {
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? 'dark' : 'light';

  return (
    <BlurView
      tint={tint}
      intensity={90}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 6 : 12,
        borderBottomWidth: 0.4,
        borderColor: tint === 'dark' ? '#444' : '#ccc',
      }}
    >
      {/* Déconnexion */}
      <Pressable onPress={() => {
          signOut();
          router.replace('/auth/sign-in');
        }}
      >
        <Ionicons name="log-out-outline" size={24} color={tint === 'dark' ? '#fff' : '#000'} />
      </Pressable>

      {/* Titre centré */}
      <Text
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'SpaceMono',
          fontSize: 18,
          color: tint === 'dark' ? '#fff' : '#000',
        }}
      >
        {title}
      </Text>

      {/* Accès Profil */}
      <Pressable onPress={() => router.push('/settings')}>
        <Ionicons
          name="person-circle-outline"
          size={28}
          color={tint === 'dark' ? '#fff' : '#000'}
        />
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
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
<<<<<<< HEAD
              title={
                route.name === 'index'
                  ? 'Accueil'
                  : route.name === 'settings'
                  ? 'Paramètres'
                  : 'Profil'
              }
=======
              title={route.name === 'index' ? 'Accueil' : (route.name === 'settings' ? "Paramètres" : "Profil")}
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
              navigation={navigation}
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
<<<<<<< HEAD

        <Tabs.Screen
          name="profil/index"
=======
        <Tabs.Screen
          name="profil"
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
<<<<<<< HEAD
          name="profil/edit/index"
          options={{ href: null, title: 'Éditer le profil' }}
        />

        <Tabs.Screen
=======
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
          name="settings"
          options={{
            href: null,
            title: 'Paramètres',
          }}
        />
        <Tabs.Screen
          name="products/[productId]"
<<<<<<< HEAD
          options={{ href: null, title: "Modification produit" }}
        />
        <Tabs.Screen
          name="products/edit/[productId]"
          options={{ href: null, title: 'Éditer le produit' }}
        />
        <Tabs.Screen
          name="products/delete/[productId]"
          options={{ href: null, title: 'Éditer le produit' }}
        />
        <Tabs.Screen
          name="products/add/index"
          options={{ href: null, title: 'Ajout de produit' }}
        />                
=======
          options={{
            href: null,
            title: 'Paramètres',
          }}
        />
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
      </Tabs>
    </SafeAreaView>
  );
}
