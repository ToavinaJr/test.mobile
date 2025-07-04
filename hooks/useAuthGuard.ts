<<<<<<< HEAD
=======
// hooks/useAuthGuard.ts
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

<<<<<<< HEAD
=======
/**
 * Protège un écran : s'il n'y a pas de token, on redirige vers /auth/sign-in
 * Renvoie également l'état `loading` pour masquer l'UI tant que le token n’est pas résolu.
 */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
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
