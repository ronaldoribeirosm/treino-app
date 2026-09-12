import { MotiView } from 'moti';
import { View } from 'react-native';

import { Text } from '@/ui/Text';
import { palette, radius } from '@/theme/tokens';

interface BarChartProps {
  data: { label: string; value: number }[];
  /** reference line (e.g. kcal target) */
  target?: number;
  color?: string;
  height?: number;
}

export function BarChart({ data, target, color = palette.lime, height = 120 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), target ?? 0) * 1.1;

  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        {data.map((d, i) => {
          const h = (d.value / max) * height;
          const above = target != null && d.value >= target;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height }}>
              <MotiView
                from={{ height: 0, opacity: 0 }}
                animate={{ height: h, opacity: 1 }}
                transition={{ type: 'timing', duration: 650, delay: i * 60 }}
                style={{
                  width: '100%',
                  borderRadius: radius.sm,
                  backgroundColor: above ? color : palette.surfaceHi,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="caption" color={palette.inkFaint}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
