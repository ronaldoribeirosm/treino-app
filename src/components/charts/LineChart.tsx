import { useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { palette } from '@/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface LineChartProps {
  data: number[];
  color?: string;
  height?: number;
  /** kg / value shown as the last-point label handled by parent */
}

/** Catmull-Rom → cubic bezier for a smooth line through all points. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function LineChart({ data, color = palette.lime, height = 150 }: LineChartProps) {
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [w, data, progress]);

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const padX = 6;
  const padY = 18;
  const chartH = height - padY * 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: padY + (1 - (v - min) / range) * chartH,
  }));

  const line = smoothPath(pts);
  const area = line ? `${line} L ${pts[pts.length - 1].x},${height} L ${pts[0].x},${height} Z` : '';
  const dash = (w || 400) * 3;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dash * (1 - progress.value),
  }));

  const last = pts[pts.length - 1];

  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Defs>
            <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.28} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* subtle baselines */}
          {[0.25, 0.5, 0.75].map((f) => (
            <Path
              key={f}
              d={`M ${padX},${padY + f * chartH} L ${w - padX},${padY + f * chartH}`}
              stroke={palette.border}
              strokeWidth={1}
            />
          ))}

          <Path d={area} fill="url(#areaFill)" />

          <AnimatedPath
            d={line}
            stroke={color}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dash}
            animatedProps={animatedProps}
          />

          {/* glowing end point */}
          <Circle cx={last.x} cy={last.y} r={7} fill={color} opacity={0.25} />
          <Circle cx={last.x} cy={last.y} r={4} fill={color} />
          <Circle cx={last.x} cy={last.y} r={4} fill="none" stroke={palette.bg} strokeWidth={1.5} />
        </Svg>
      )}
    </View>
  );
}
