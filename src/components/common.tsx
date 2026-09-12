import { MotiView } from 'moti';
import { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Card } from '@/ui/Card';
import { Text } from '@/ui/Text';
import { PressableScale } from '@/ui/PressableScale';
import { palette, radius, space } from '@/theme/tokens';

/** Fade + rise entrance. Stagger by passing an incrementing index. */
export function Reveal({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 420, delay: 60 + index * 70 }}
      style={style}>
      {children}
    </MotiView>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="displaySm" color={palette.inkMuted}>
        {title}
      </Text>
      {actionLabel ? (
        <PressableScale onPress={onAction} haptic={false}>
          <Text variant="label" color={palette.lime}>
            {actionLabel}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

export function StatTile({
  icon: Icon,
  value,
  unit,
  label,
  color = palette.lime,
}: {
  icon: LucideIcon;
  value: string;
  unit?: string;
  label: string;
  color?: string;
}) {
  return (
    <Card style={styles.tile} padded={false}>
      <View style={styles.tileInner}>
        <Icon size={18} color={color} strokeWidth={2.4} />
        <View style={styles.tileValueRow}>
          <Text variant="stat">{value}</Text>
          {unit ? (
            <Text variant="caption" color={palette.inkMuted} style={{ marginBottom: 3 }}>
              {unit}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" color={palette.inkFaint}>
          {label}
        </Text>
      </View>
    </Card>
  );
}

export function XPBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={styles.xpTrack}>
      <MotiView
        from={{ width: '0%' }}
        animate={{ width: `${pct * 100}%` }}
        transition={{ type: 'timing', duration: 900, delay: 300 }}
        style={[styles.xpFill, { backgroundColor: color }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
    marginTop: space.xxl,
  },
  tile: {
    flex: 1,
  },
  tileInner: {
    padding: space.md,
    gap: 6,
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  xpTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceHi,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
