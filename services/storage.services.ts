import AsyncStorage from '@react-native-async-storage/async-storage';

<<<<<<< HEAD
export const storage = {
  set: <T>(key: string, value: T) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

=======
/**
 * Stockage clé/valeur JSON typé.
 * Si vous voulez chiffrer certains éléments, remplacez ici par expo‑secure-store.
 */
export const storage = {
  /** Enregistre n’importe quelle valeur sérialisable. */
  set: <T>(key: string, value: T) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

  /** Récupère une valeur, ou `null` si rien en cache. */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
  get: async <T>(key: string): Promise<T | null> => {
    const str = await AsyncStorage.getItem(key);
    return str ? (JSON.parse(str) as T) : null;
  },
<<<<<<< HEAD
  
  remove: (key: string) => AsyncStorage.removeItem(key),


  multiRemove: (keys: string[]) => AsyncStorage.multiRemove(keys),
};
=======

  /** Supprime une clé. */
  remove: (key: string) => AsyncStorage.removeItem(key),

  /** Supprime plusieurs clés d’un coup. */
  multiRemove: (keys: string[]) => AsyncStorage.multiRemove(keys),
};
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
