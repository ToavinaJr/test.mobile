// services/key.services.ts
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY_ID = 'aes-secret-key';

export async function getOrCreateKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(KEY_ID);
  if (!key) {
    const bytes = await Crypto.getRandomBytesAsync(32);
    key = Buffer.from(bytes).toString('base64');
    await SecureStore.setItemAsync(KEY_ID, key);
  }
  return key;
}
