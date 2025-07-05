import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export function useAuthGuard() {
  const { token, loading } = useAuth();
  const router = useRouter();

  // Ce `useEffect` est un garde de navigation. Il s'assure que si l'application
  // n'est plus en état de chargement et qu'aucun jeton d'authentification n'est présent,
  // l'utilisateur est redirigé vers la page de connexion.
  // Les dépendances `loading`, `token` et `router` sont essentielles pour que
  // le hook réagisse correctement aux changements d'état d'authentification et de routage.
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/auth/sign-in');
    }
  }, [loading, token, router]);

  return { loading, token };
}