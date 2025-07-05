import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * @namespace storage
 * @description Un service utilitaire pour interagir avec `AsyncStorage` de manière simplifiée,
 * gérant automatiquement la sérialisation/désérialisation JSON.
 */
export const storage = {
  /**
   * @function set
   * @description Stocke une valeur dans `AsyncStorage` sous une clé donnée. La valeur est automatiquement convertie en JSON stringifié.
   * @template T Le type de la valeur à stocker.
   * @param {string} key - La clé unique sous laquelle stocker la valeur.
   * @param {T} value - La valeur à stocker.
   * @returns {Promise<void>} Une promesse qui se résout une fois que la valeur est stockée avec succès.
   */
  set: <T>(key: string, value: T) => {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * @function get
   * @description Récupère une valeur de `AsyncStorage` par sa clé et la parse depuis une chaîne JSON.
   * @template T Le type attendu de la valeur récupérée.
   * @param {string} key - La clé de la valeur à récupérer.
   * @returns {Promise<T | null>} Une promesse qui se résout avec la valeur parsée si elle existe, ou `null` si la clé n'existe pas ou si la valeur ne peut pas être parsée.
   */
  get: async <T>(key: string): Promise<T | null> => {
    const str = await AsyncStorage.getItem(key);

    if (!str) {
      return null;
    }

    try {
      return JSON.parse(str) as T;
    } catch (error) {
      console.error(`Error parsing data for key "${key}":`, str, error);
      return null;
    }
  },

  /**
   * @function remove
   * @description Supprime une valeur de `AsyncStorage` par sa clé.
   * @param {string} key - La clé de la valeur à supprimer.
   * @returns {Promise<void>} Une promesse qui se résout une fois la valeur supprimée.
   */
  remove: (key: string) => AsyncStorage.removeItem(key),

  /**
   * @function multiRemove
   * @description Supprime plusieurs valeurs de `AsyncStorage` par leurs clés.
   * @param {string[]} keys - Un tableau de clés à supprimer.
   * @returns {Promise<void>} Une promesse qui se résout une fois toutes les valeurs supprimées.
   */
  multiRemove: (keys: string[]) => AsyncStorage.multiRemove(keys),
};