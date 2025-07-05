// ✨ PaginationButton.tsx
import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

type Props = {
  label: string | number;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  style?: ViewStyle;
};

const PaginationButton: React.FC<Props> = ({
  label,
  onPress,
  disabled = false,
  active = false,
  style,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    // Animation “scale down” au clic
    style={({ pressed }) => [
      {
        transform: [{ scale: pressed ? 0.96 : 1 }],
      },
      style,
    ]}
    className={`
      mx-1 overflow-hidden rounded-full
      ${disabled ? 'opacity-40' : 'active:opacity-80'}
      shadow-lg shadow-black/5
    `}
  >
    <Text
      className={`
        px-5 py-2 text-sm font-bold
        ${active ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}
        ${disabled ? '' : 'dark:bg-gray-600'}
      `}
    >
      {label}
    </Text>
  </Pressable>
);

export default PaginationButton;
