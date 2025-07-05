import React, { useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InputTextCard from "@/components/ui/InputTextCard";
import ButtonCard from "@/components/ui/ButtonCard";
import { useSignIn } from "@/hooks/auth/useSignIn";


export default function SignInScreen() {
  const {
    email,
    password,
    showPW,
    emailErr,
    passErr,
    isSigningIn,
    signInError,
    token,
    handleChangeEmail,
    handleChangePassword,
    toggleShowPassword,
    handleSubmit,
  } = useSignIn();

  useEffect(() => {
    if (!isSigningIn && token) {
      router.replace("/(tabs)");
    }
    if (!isSigningIn && signInError) {
      Alert.alert("Erreur", signInError);
    }
  }, [isSigningIn, token, signInError]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-white p-6">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="lock-closed-outline" size={64} color="#4f46e5" />
          <Text className="mt-4 text-3xl font-extrabold text-blue-800">
            Bienvenue !
          </Text>
          <Text className="text-base text-gray-600 mb-8 text-center">
            Connectez-vous pour continuer
          </Text>

          <View className="w-full max-w-md">
            <InputTextCard
              title="Email"
              placeholder="Entrez votre email"
              value={email}
              onChangeText={handleChangeEmail}
              isValid={emailErr === null}
              messageStatus={emailErr}
            />

            <View className="h-4" />

            <InputTextCard
              title="Mot de passe"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChangeText={handleChangePassword}
              secureTextEntry={!showPW}
              isPassword
              onPressSecure={toggleShowPassword}
              isValid={passErr === null}
              messageStatus={passErr}
            />

            <View className="h-6" />

            {isSigningIn ? (
              <View className="w-full py-3 rounded-xl bg-indigo-600 items-center">
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <ButtonCard
                title="Se connecter"
                onPress={handleSubmit}
                containerStyle="w-full py-3"
                textStyle="text-lg"
              />
            )}

            <TouchableOpacity
              className="mt-6"
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text className="text-blue-600 text-center font-semibold">
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-600">Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/sign-up")}>
                <Text className="text-blue-600 font-semibold">
                  Inscrivez-vous
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}