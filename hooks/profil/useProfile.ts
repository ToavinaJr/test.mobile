import { useState, useEffect, useCallback } from 'react';
import { getUserDetails } from '@/services/auth.services';
import { useFocusEffect } from '@react-navigation/native';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

/**
 * Hook personnalisé pour charger et gérer les détails du profil utilisateur.
 * Utilise useFocusEffect pour recharger les données lorsque l'écran est mis au point.
 */
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

  // Recharge le profil chaque fois que l'écran est mis au point
  useFocusEffect(
    useCallback(() => {
      loadProfile();
      // Pas besoin de fonction de nettoyage spécifique pour isActive ici
      // car loadProfile est déjà useCallback et ne dépend pas de l'état local isActive
    }, [loadProfile])
  );

  return { user, loading, loadProfile };
};
