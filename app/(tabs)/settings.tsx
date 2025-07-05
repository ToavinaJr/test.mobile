import React from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '@/services/auth.services';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/auth-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const scheme = useColorScheme();
  const [isDark, setIsDark] = React.useState(scheme === 'dark');

  const toggleTheme = () => {
    setIsDark((prev) => !prev);    
  };

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
        <Ionicons
          name={icon}
          size={20}
          color={scheme === 'dark' ? '#fff' : '#000'}
        />
        <Text className="ml-3 text-base text-gray-800 dark:text-gray-200">
          {label}
        </Text>
      </View>
      {right}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <Text className="text-xl font-bold px-4 py-3 text-gray-800 dark:text-gray-100">
        Paramètres
      </Text>

      <View className="mt-4 bg-white dark:bg-gray-800 rounded-xl mx-3 overflow-hidden shadow-sm">
        <Item
          icon="person-circle-outline"
          label="Mon profil"
          onPress={() => router.push('/profil')}
        />

        <Item
          icon={isDark ? 'moon-outline' : 'sunny-outline'}
          label="Mode sombre"
          onPress={toggleTheme}
          right={<Switch value={isDark} onValueChange={toggleTheme} />}
        />

        <Item
          icon="pricetags-outline"
          label="Liste des produits"
          onPress={() => router.push('/')}
        />

        <Item
          icon="log-out-outline"
          label="Déconnexion"
          onPress={async () => {
            await signOut();
            await refresh();
            router.replace('/auth/sign-in');
          }}
        />
      </View>
    </SafeAreaView>
  );
}
