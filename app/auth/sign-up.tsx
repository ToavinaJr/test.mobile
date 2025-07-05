import React, { useEffect } from "react";
import { View, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import ButtonCard from "@/components/ui/ButtonCard";
import InputTextCard from "@/components/ui/InputTextCard";
import { useSignUp } from "@/hooks/auth/useSignUp";

const SignUpScreen: React.FC = () => {
  const {
    form,
    errors,
    showPassword,
    showConfirmPassword,
    isSigningUp,
    signUpError,
    signUpSuccess,
    handleChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
    handleSubmit,
  } = useSignUp();

  useEffect(() => {
    if (signUpSuccess) {
      Alert.alert("Succès", "Inscription réussie ! Vous pouvez maintenant vous connecter.");
      router.replace("/auth/sign-in");
    }
    if (signUpError) {
      Alert.alert("Erreur", signUpError);
    }
  }, [signUpSuccess, signUpError]);

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-white p-6">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-4xl font-extrabold text-blue-800 mb-2">Crée ton compte</Text>
          <Text className="text-lg text-gray-600 mb-8 text-center">
            Rejoins-nous en quelques secondes
          </Text>

          <View className="w-full max-w-md">
            <InputTextCard
              title="Nom"
              placeholder="Entrez votre nom"
              value={form.name}
              onChangeText={handleChange("name")}
              isValid={errors.name === null}
              messageStatus={errors.name}
            />
            <View className="h-4" />

            <InputTextCard
              title="Email"
              placeholder="Entrez votre email"
              value={form.email}
              onChangeText={handleChange("email")}
              isValid={errors.email === null}
              messageStatus={errors.email}
            />
            <View className="h-4" />

            <InputTextCard
              title="Mot de passe"
              placeholder="Entrez votre mot de passe"
              value={form.password}
              onChangeText={handleChange("password")}
              secureTextEntry={!showPassword}
              isPassword
              isValid={errors.password === null}
              messageStatus={errors.password}
              onPressSecure={toggleShowPassword}
            />
            <View className="h-4" />

            <InputTextCard
              title="Confirmation du mot de passe"
              placeholder="Confirmez votre mot de passe"
              value={form.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              secureTextEntry={!showConfirmPassword}
              isPassword
              isValid={errors.confirmPassword === null}
              messageStatus={errors.confirmPassword}
              onPressSecure={toggleShowConfirmPassword}
            />
            <View className="h-8" />

            <ButtonCard
              title={isSigningUp ? "Création..." : "S'inscrire"}
              onPress={handleSubmit}
              disabled={isSigningUp}
              containerStyle="w-full py-3"
              textStyle="text-xl"
            />

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-600 text-base">Déjà inscrit ? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/sign-in")}>
                <Text className="text-blue-600 text-base font-semibold">
                  Connecte-toi
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