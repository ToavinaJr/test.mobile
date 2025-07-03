import { View, Text, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import ButtonCard from '@/components/ui/ButtonCard';
import InputTextCard from '@/components/ui/InputTextCard';
import { signIn } from '@/services/auth.services';
import { signInSchema } from '@/schemas/sign-in.schema';
import { ZodError } from 'zod';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';


const SignInScreen = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [emailError, setEmailError] = useState<string | null | boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null| boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (text: string) => {
    try {
      signInSchema.pick({ email: true }).parse({ email: text });
      setEmailError(null);
    } catch (error) {
      if (error instanceof ZodError) {
        setEmailError(error.errors[0]?.message || 'Email invalide');
      }
    }
  };

  const validatePassword = (text: string) => {
    try {
      signInSchema.pick({ password: true }).parse({ password: text });
      setPasswordError(null);
    } catch (error) {
      if (error instanceof ZodError) {
        setPasswordError(error.errors[0]?.message || 'Mot de passe invalide');
      }
    }
  };

  const handleSignIn = async () => {
    try {
      await signInSchema.parseAsync({ email, password });
      setEmailError(null);
      setPasswordError(null);
    } catch (error) {
      if (error instanceof ZodError) {
        error.errors.forEach((err) => {
          if (err.path[0] === "email") setEmailError(err.message);
          if (err.path[0] === "password") setPasswordError(err.message);
        });
        return;
      }
    }
    
    setIsLoading(true);
    const result = await signIn({ email, password });
    setIsLoading(false);
  
    if (result.success && result.token) {
        login(result.token);  
        router.replace('/(tabs)'); 
    } else {
      Alert.alert(
        "Erreur de connexion",
        result.message || "Échec de la connexion."
      );
      console.log("Erreur de connexion :", result.message || "Échec de la connexion.");
    }
  };
  

  return (
    <>
    <Stack.Screen options={{
      headerShown: false,
      title: 'Connexion',
      headerStyle: { backgroundColor: '#f8f9fa' },
      headerTintColor: '#343a40',
    }} />
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-4xl font-extrabold text-blue-800 mb-2">Bienvenue !</Text>
        <Text className="text-lg text-gray-600 mb-8 text-center">Connectez-vous pour continuer</Text>

        <View className="w-full max-w-md">
          <InputTextCard
            title='Email'
            placeholder="Entrez votre email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              validateEmail(text);
            }}
            isValid={emailError === null}
            messageStatus={emailError}
          />
          <View className="h-4" />
          <InputTextCard
            title='Mot de passe'
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={text => {
              setPassword(text);
              validatePassword(text);
            }}
            secureTextEntry={!showPassword}
            isPassword={true}
            isValid={passwordError === null}
            messageStatus={passwordError}
            onPressSecure={() => setShowPassword(!showPassword)}
          />
          
          <View className="h-8" />
          <ButtonCard
            title={isLoading ? "Connexion..." : "Se connecter"}
            onPress={handleSignIn}
            disabled={isLoading}
            containerStyle="w-full py-3"
            textStyle="text-xl"
          />

          <TouchableOpacity className="mt-6" onPress={() => router.push('/auth/forgot-password')}>
            <Text className="text-blue-600 text-center text-base font-semibold">Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View className="mt-8 flex-row justify-center items-center">
            <Text className="text-gray-600 text-base">Vous n'avez pas de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
              <Text className="text-blue-600 text-base font-semibold">Inscrivez-vous</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    </>
  );
};

export default SignInScreen;