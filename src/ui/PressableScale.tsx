import * as Haptics from 'expo-haptics';
import { Platform, Pressable, PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends PressableProps {
  /** target scale on press-in (default 0.96) */
  scaleTo?: number;
  /** fire a light haptic on press-in (native only) */
  haptic?: boolean;
}

/**
 * A Pressable that springs down on press for instant, physical feedback.
 * Emil: "Buttons must feel responsive to press." Spring keeps it interruptible.
 */
export function PressableScale({
  scaleTo = 0.96,
  haptic = true,
  onPressIn,
  onPressOut,
  style,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { mass: 0.4, stiffness: 320, damping: 18 });
        if (haptic && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { mass: 0.4, stiffness: 320, damping: 16 });
        onPressOut?.(e);
      }}
      style={[animatedStyle, style as object]}>
      {children as React.ReactNode}
    </AnimatedPressable>
  );
}
