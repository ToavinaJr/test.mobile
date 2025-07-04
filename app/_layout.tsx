import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/auth-context';
import { useColorScheme } from '@/components/useColorScheme';
import './global.css'

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (error) throw error;
  if (!loaded) return null;
<<<<<<< HEAD
  
=======

  // Cache le splash dès que la police ET l'auth sont prêtes (voir TabsLayout)
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
  SplashScreen.hideAsync();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
<<<<<<< HEAD
=======
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
