import { StyleSheet, View, ViewStyle } from 'react-native';

import { Text } from './Text';
import { radius, space } from '@/theme/tokens';

interface BadgeProps {
  label: string;
  color: string;
  /** solid fill vs tinted translucent */
  solid?: boolean;
  style?: ViewStyle;
}

/** Small uppercase status chip. Tinted background = darker shade of the accent hue. */
export function Badge({ label, color, solid = false, style }: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        solid
          ? { backgroundColor: color }
          : { backgroundColor: color + '22', borderColor: color + '55', borderWidth: 1 },
        style,
      ]}>
      <Text variant="mono" color={solid ? '#0A0A0F' : color} style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    letterSpacing: 1,
  },
});
