import { Text, Pressable } from 'react-native'
import React from 'react'

type ButtonCardProps = {
    title?: string;
    onPress?: () => void;
    disabled?: boolean;
    containerStyle?: string;
    textStyle?: object | string;
}

const ButtonCard = ({
    title = 'Button',
    onPress,
    disabled = false,
    containerStyle = '',
    textStyle = {}
    }: ButtonCardProps & {
    children?: React.ReactNode;
}) => {
  return (
    <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`bg-blue-500 p-4 rounded-lg ${containerStyle}`}
        style={({ pressed }) => [
            {
                opacity: pressed ? 0.5 : 1,
            },
        ]}
    >
        <Text
            className={`text-white text-center text-lg font-semibold ${textStyle}`}
        >
            {title}
        </Text>
    </Pressable>
  )
}

export default ButtonCard