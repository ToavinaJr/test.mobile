import { View, Text, TextInput, Pressable } from 'react-native';
import React from 'react';
import { Feather, Ionicons } from "@expo/vector-icons";

type InputTextCardProps = {
    title: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    onPressSecure?: () => void;
    style?: string;
    isPassword?: boolean;
    messageStatus?: string | null | undefined | boolean;
    isValid?: boolean;
    type?: 'text' | 'email' | 'password';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad' | 'number-pad';
    onBlur?: () => void; // Ajout de la prop onBlur
}

const InputTextCard = ({
    title,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    messageStatus,
    onPressSecure,
    isPassword,
    isValid = true,
    type = 'text',
    keyboardType = 'default',
    onBlur, 
}: InputTextCardProps) => {
  const [secure, setSecure] = React.useState(secureTextEntry);

  React.useEffect(() => {
    setSecure(secureTextEntry);
  }, [secureTextEntry]);

  const toggleSecureEntry = () => {
    setSecure(prev => !prev);
    if (onPressSecure) {
      onPressSecure();
    }
  };

  const borderColor = isValid ? 'border-gray-300' : 'border-red-500';
  const textColor = isValid ? 'text-gray-500' : 'text-red-500';

  return (
    <View>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        className={`border ${borderColor} p-4 rounded-lg bg-white text-black`}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onBlur={onBlur}
      />

      {!isValid && messageStatus && (
        <Text className={`text-xs mt-1 ${textColor}`}>
          {messageStatus}
        </Text>
      )}

      {isValid && !messageStatus && (
        <View className='flex flex-row items-center mt-1'>
          <Ionicons name='checkmark-circle' size={16} color='green'/>
          <Text className='ml-1 text-green-600 text-xs'>{title} est valide</Text>
        </View>
      )}

      {isPassword &&
        <Pressable onPress={toggleSecureEntry} className={`absolute right-4 top-4`}>
          <Feather name={secure ? "eye-off" : "eye"} size={22} color="#666" />
        </Pressable>
      }
    </View>
  );
}

export default InputTextCard;
