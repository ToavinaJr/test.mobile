import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserDetails, updateUser } from '@/services/auth.services';
import { useRouter } from 'expo-router';

export default function EditProfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });

  /* charge infos */
  useEffect(() => {
    (async () => {
      const details = await getUserDetails();
      if (details) setForm({ name: details.name, email: details.email });
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Erreur', 'Nom et email sont requis.');
      return;
    }
    setSaving(true);
    try {
      await updateUser(form);
      Alert.alert('Succès', 'Profil mis à jour.');
      router.replace('/profil');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black p-6">
      {/* Header simple --------------------------------------------------- */}

      <View className='w-full flex justify-center items-center '>
        <Text className="font-bold text-3xl  text-gray-800 dark:text-white mb-8">
          Modifier le profil
        </Text>
      </View>
      

      {/* Formulaire ------------------------------------------------------ */}
      <View className="space-y-4">
        <View>
          <Text className="ml-1 mb-1 text-lg text-gray-600 dark:text-gray-400">
            Nom
          </Text>
          <TextInput
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
          />
        </View>

        <View className='mt-4'>
          <Text className="ml-1 mb-1 text-lg text-gray-600 dark:text-gray-400">
            Email
          </Text>
          <TextInput
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
          />
        </View>
      </View>

      {/* Bouton save ----------------------------------------------------- */}
      <Pressable
        disabled={saving}
        onPress={handleSave}
        className={`mt-10 items-center py-4 rounded-xl ${
          saving ? 'bg-gray-400' : 'bg-indigo-600'
        }`}
      >
        <Text className="text-white font-semibold">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
