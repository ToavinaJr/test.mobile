/**
 * EditProfilScreen
 * ---------------------------------------------------------------------------
 * Écran de modification du profil utilisateur.
 * - Charge les infos utilisateur via getUserDetails au montage.
 * - Permet de modifier le nom et l’email avec validation en temps réel (Zod).
 * - Sauvegarde les changements via updateUser.
 * - Affiche loader, erreurs et feedback utilisateur.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDetails, updateUser } from '@/services/auth-services';
import { useRouter } from 'expo-router';
import { ZodError } from 'zod';
import { editProfileSchema, EditProfileFormInput } from '@/schemas/profil/profil-edit.schema';
import InputTextCard from '@/components/ui/InputTextCard';

export default function EditProfilScreen() {
  // Navigation avec Expo Router
  const router = useRouter();

  // États locaux pour chargement & sauvegarde
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État du formulaire avec valeurs initiales vides
  const [form, setForm] = useState<EditProfileFormInput>({
    name: '',
    email: '',
  });

  // États d'erreur pour validation des champs
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  /**
   * Validation en temps réel d’un champ précis avec Zod
   * @param field - nom du champ ('name' | 'email')
   * @param value - valeur à valider
   */
  const validateField = (field: keyof EditProfileFormInput, value: string) => {
    try {
      // Validation partielle pour un seul champ
      editProfileSchema.pick({ [field]: true } as never).parse({ [field]: value });
      if (field === 'name') setNameErr(null);
      if (field === 'email') setEmailErr(null);
    } catch (e) {
      if (e instanceof ZodError) {
        // Récupération du message d'erreur
        const msg = e.errors[0]?.message || "Valeur invalide";
        if (field === 'name') setNameErr(msg);
        if (field === 'email') setEmailErr(msg);
      }
    }
  };

  /**
   * Chargement des détails utilisateur au montage du composant
   */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const details = await getUserDetails();
      if (details) {
        setForm({ name: details.name, email: details.email });
      }
      setLoading(false);
    })();
  }, []);

  /**
   * Sauvegarde du formulaire après validation complète
   */
  const handleSave = async () => {
    // Réinitialisation des erreurs
    setNameErr(null);
    setEmailErr(null);

    try {
      // Validation complète avec Zod
      await editProfileSchema.parseAsync(form);
    } catch (e) {
      if (e instanceof ZodError) {
        // Attribution des messages d'erreur aux champs concernés
        e.errors.forEach((err) => {
          if (err.path[0] === 'name') setNameErr(err.message);
          if (err.path[0] === 'email') setEmailErr(err.message);
        });
      }
      return; // Stop sauvegarde en cas d’erreur
    }

    // Sauvegarde et feedback utilisateur
    setSaving(true);
    try {
      await updateUser(form);
      Alert.alert('Succès', 'Profil mis à jour.');
      router.replace('/profil'); // Redirection vers la page profil
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de sauvegarder le profil. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------------------------------------------- */
  /* Affichage loader global pendant la récupération des données            */
  /* ----------------------------------------------------------------------- */
  if (loading)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );

  /* ----------------------------------------------------------------------- */
  /* Affichage formulaire d’édition                                         */
  /* ----------------------------------------------------------------------- */
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black p-6">
      {/* Titre de l’écran */}
      <View className="w-full flex justify-center items-center">
        <Text className="font-bold text-3xl text-gray-800 dark:text-white mb-8">
          Modifier le profil
        </Text>
      </View>

      {/* Champs du formulaire */}
      <View className="space-y-4">
        {/* Champ Nom */}
        <View>
          <Text className="ml-1 mb-1 text-lg text-gray-600 dark:text-gray-400">
            Nom
          </Text>
          <InputTextCard
            title="Nom"
            placeholder="Entrez votre nom"
            value={form.name}
            onChangeText={(v) => {
              setForm({ ...form, name: v });
              validateField('name', v);
            }}
            isValid={nameErr === null}
            messageStatus={nameErr}
          />
        </View>

        {/* Champ Email */}
        <View className="mt-4">
          <Text className="ml-1 mb-1 text-lg text-gray-600 dark:text-gray-400">
            Email
          </Text>
          <InputTextCard
            title="Email"
            placeholder="Entrez votre email"
            value={form.email}
            onChangeText={(v) => {
              setForm({ ...form, email: v });
              validateField('email', v);
            }}
            isValid={emailErr === null}
            messageStatus={emailErr}
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Bouton sauvegarde */}
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
