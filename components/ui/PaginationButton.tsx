// components/ui/PaginationButton.tsx
import React from 'react';
import { Pressable, Text } from 'react-native';

type Props = {
  label: string | number;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;          // pour les flèches ◀ ▶
};

const PaginationButton: React.FC<Props> = ({
  label,
  onPress,
  active = false,
  disabled = false,
  compact = false,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      {
        opacity: disabled ? 0.5 : 1,
        backgroundColor: active ? '#4f46e5' : 'gray',
      },
      { transform: [{ scale: pressed && !disabled ? 0.94 : 1 }] },
    ]}
    className={`
      mx-1 overflow-hidden rounded-full shadow
      ${compact ? 'px-3 py-2' : 'px-5 py-3'}
      ${disabled
        ? 'bg-gray-300 dark:bg-gray-600 opacity-50'
        : active
        ? 'bg-indigo-700'
        : 'bg-gray-200 dark:bg-gray-700'}
    `}
  >
    <Text
      className={`
        text-sm font-bold
        ${active ? 'text-white' : 'text-gray-800 dark:text-gray-100'}
      `}
    >
      {label}
    </Text>
  </Pressable>
);

export default PaginationButton;
