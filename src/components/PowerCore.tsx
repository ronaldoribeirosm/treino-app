import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Polygon } from 'react-native-svg';

import { palette } from '@/theme/tokens';

interface PowerCoreProps {
  color: string;
  size?: number;
  children?: React.ReactNode; // overlay (e.g. level short)
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(' ');
}

/** Animated "power level" avatar. Rings orbit, core breathes, glow tints by level. */
export function PowerCore({ color, size = 132, children }: PowerCoreProps) {
  const spin = useSharedValue(0);
  const spin2 = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1);
    spin2.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1);
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [spin, spin2, pulse]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-spin2.value * 360}deg` }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.05 }],
    opacity: 0.85 + pulse.value * 0.15,
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + pulse.value * 0.22,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  const cx = size / 2;
  const c = cx;
  const outerR = cx - 6;
  const midR = cx - 22;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* soft glow */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          glowStyle,
        ]}
      />

      {/* outer orbit ring (dashed) */}
      <Animated.View style={[{ position: 'absolute' }, outerStyle]}>
        <Svg width={size} height={size}>
          <Circle
            cx={c}
            cy={c}
            r={outerR}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="2 10"
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
        </Svg>
      </Animated.View>

      {/* mid ring (counter-rotating, ticks) */}
      <Animated.View style={[{ position: 'absolute' }, innerStyle]}>
        <Svg width={size} height={size}>
          <Circle cx={c} cy={c} r={midR} stroke={palette.borderStrong} strokeWidth={1} fill="none" />
          <Circle
            cx={c}
            cy={c}
            r={midR}
            stroke={color}
            strokeWidth={3}
            strokeDasharray={`${2 * Math.PI * midR * 0.34} ${2 * Math.PI * midR}`}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* hex core */}
      <Animated.View style={[{ position: 'absolute' }, coreStyle]}>
        <Svg width={size} height={size}>
          <Polygon points={hexPoints(c, c, midR - 14)} fill={color + '26'} stroke={color} strokeWidth={2} />
          <Polygon points={hexPoints(c, c, midR - 24)} fill={color + '14'} stroke={color + '55'} strokeWidth={1} />
        </Svg>
      </Animated.View>

      {children}
    </View>
  );
}
