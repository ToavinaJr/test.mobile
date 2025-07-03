import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  set: <T>(key: string, value: T) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

  get: async <T>(key: string): Promise<T | null> => {
    const str = await AsyncStorage.getItem(key);
    return str ? (JSON.parse(str) as T) : null;
  },
  
  remove: (key: string) => AsyncStorage.removeItem(key),


  multiRemove: (keys: string[]) => AsyncStorage.multiRemove(keys),
};