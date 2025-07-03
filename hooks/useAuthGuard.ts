// hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

/**
 * Protège un écran : s'il n'y a pas de token, on redirige vers /auth/sign-in
 * Renvoie également l'état `loading` pour masquer l'UI tant que le token n’est pas résolu.
 */
export function useAuthGuard() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/auth/sign-in');
    }
  }, [loading, token, router]);

  return { loading, token };
}
