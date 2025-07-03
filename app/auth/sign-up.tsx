import React, { useState } from "react";
import { View, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";

import ButtonCard from "@/components/ui/ButtonCard";
import InputTextCard from "@/components/ui/InputTextCard";
import {
  SignUpFormInput,
  signUpFieldSchemas,
  signUpSchema,
} from "@/schemas/sign-up.schema";
import { signUp } from "@/services/auth.services";

/* ─────────── Helpers ─────────── */

type FieldStatus = string | null | boolean; 
type FormErrors = Record<keyof SignUpFormInput, FieldStatus>;

/** Valide un champ isolé. */
const validateField = (
  field: keyof SignUpFormInput,
  value: string,
  form: SignUpFormInput
): string | null => {
  // Validation simple par Zod
  const check = signUpFieldSchemas[field].safeParse(value);
  if (!check.success) return check.error.errors[0].message;

  // Règles dépendantes
  if (field === "confirmPassword" && value !== form.password) {
    return "Les mots de passe ne correspondent pas.";
  }
  if (field === "password" && form.confirmPassword && value !== form.confirmPassword) {
    // le password vient de changer : confirmPassword sera re‑validé juste après
    return null;
  }
  return null; // aucune erreur
};

/* ─────────── Composant ─────────── */

const SignUpScreen: React.FC = () => {
  const [form, setForm] = useState<SignUpFormInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Tous les champs commencent en « invalide » (false)
  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* ─────────── Handle input change ─────────── */
  const onChange =
    (field: keyof SignUpFormInput) =>
    (value: string) => {
      // 1. maj state
      const newForm = { ...form, [field]: value };
      setForm(newForm);

      // 2. validation champ courant
      const fieldError = validateField(field, value, newForm);

      // 3. re‑valider les dépendances si besoin
      const newErrors: FormErrors = { ...errors, [field]: fieldError };

      if (field === "password" && form.confirmPassword) {
        newErrors.confirmPassword = validateField(
          "confirmPassword",
          form.confirmPassword,
          newForm
        );
      }

      setErrors(newErrors);
    };

  /* ─────────── Submit ─────────── */
  const handleSubmit = async () => {
    // Vérif finale (sécurité)
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      const finalErrs: FormErrors = { ...errors };
      parsed.error.errors.forEach((e) => {
        finalErrs[e.path[0] as keyof SignUpFormInput] = e.message;
      });
      setErrors(finalErrs);
      Alert.alert("Erreur", "Veuillez corriger les champs en rouge.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signUp(form);
      if (res.success) {
        Alert.alert("Succès", res.message ?? "Inscription réussie !");
        router.replace("/auth/sign-in");
      } else {
        Alert.alert("Erreur", res.message ?? "Échec de l’inscription.");
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ─────────── UI ─────────── */
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-white p-6">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-4xl font-extrabold text-blue-800 mb-2">Crée ton compte</Text>
          <Text className="text-lg text-gray-600 mb-8 text-center">
            Rejoins‑nous en quelques secondes
          </Text>

          <View className="w-full max-w-md">
            {/* Nom */}
            <InputTextCard
              title="Nom"
              placeholder="Entrez votre nom"
              value={form.name}
              onChangeText={onChange("name")}
              isValid={errors.name === null}
              messageStatus={errors.name}
            />
            <View className="h-4" />

            {/* Email */}
            <InputTextCard
              title="Email"
              placeholder="Entrez votre email"
              value={form.email}
              onChangeText={onChange("email")}
              isValid={errors.email === null}
              messageStatus={errors.email}
            />
            <View className="h-4" />

            {/* Mot de passe */}
            <InputTextCard
              title="Mot de passe"
              placeholder="Entrez votre mot de passe"
              value={form.password}
              onChangeText={onChange("password")}
              secureTextEntry={!showPassword}
              isPassword
              isValid={errors.password === null}
              messageStatus={errors.password}
              onPressSecure={() => setShowPassword((p) => !p)}
            />
            <View className="h-4" />

            {/* Confirmation */}
            <InputTextCard
              title="Confirmeation e mot de passe"
              placeholder="Confirmez votre mot de passe"
              value={form.confirmPassword}
              onChangeText={onChange("confirmPassword")}
              secureTextEntry={!showConfirmPassword}
              isPassword
              isValid={errors.confirmPassword === null}
              messageStatus={errors.confirmPassword}
              onPressSecure={() => setShowConfirmPassword((p) => !p)}
            />
            <View className="h-8" />

            {/* Bouton */}
            <ButtonCard
              title={isLoading ? "Création..." : "S'inscrire"}
              onPress={handleSubmit}
              disabled={isLoading}
              containerStyle="w-full py-3"
              textStyle="text-xl"
            />

            {/* Lien sign‑in */}
            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-600 text-base">Déjà inscrit ? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/sign-in")}>
                <Text className="text-blue-600 text-base font-semibold">
                  Connecte‑toi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;
