import { useState, useEffect, useCallback } from 'react';
import { getUserDetails } from '@/services/auth-services';
import { useFocusEffect } from '@react-navigation/native';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const useProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const details = await getUserDetails();
      setUser(details);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  return { user, loading, loadProfile };
};
