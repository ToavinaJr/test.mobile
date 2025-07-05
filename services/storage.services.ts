// services/storage.services.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  set: <T>(key: string, value: T) => {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  },

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

  remove: (key: string) => AsyncStorage.removeItem(key),

  multiRemove: (keys: string[]) => AsyncStorage.multiRemove(keys),
};