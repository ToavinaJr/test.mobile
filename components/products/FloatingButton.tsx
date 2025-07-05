import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

export default function FloatingButton({children}: {children?: React.ReactNode}) {
  const x = useSharedValue(20);
  const y = useSharedValue(550);

  const onGesture = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = x.value;
      ctx.startY = y.value;
    },
    onActive: (e, ctx) => {
      x.value = ctx.startX + e.translationX;
      y.value = ctx.startY + e.translationY;
    },
    onEnd: (e) => {
      // léger momentum
      x.value = withDecay({ velocity: e.velocityX, clamp: [0, 300] });
      y.value = withDecay({ velocity: e.velocityY, clamp: [0, 700] });
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={onGesture}>
      <Animated.View
        style={style}
        className="absolute z-50"
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}
