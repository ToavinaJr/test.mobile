import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

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
