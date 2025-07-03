import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stockage clé/valeur JSON typé.
 * Si vous voulez chiffrer certains éléments, remplacez ici par expo‑secure-store.
 */
export const storage = {
  /** Enregistre n’importe quelle valeur sérialisable. */
  set: <T>(key: string, value: T) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

  /** Récupère une valeur, ou `null` si rien en cache. */
  get: async <T>(key: string): Promise<T | null> => {
    const str = await AsyncStorage.getItem(key);
    return str ? (JSON.parse(str) as T) : null;
  },

  /** Supprime une clé. */
  remove: (key: string) => AsyncStorage.removeItem(key),

  /** Supprime plusieurs clés d’un coup. */
  multiRemove: (keys: string[]) => AsyncStorage.multiRemove(keys),
};
