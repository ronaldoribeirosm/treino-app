import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { palette, radius, space } from '@/theme/tokens';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  /** subtle raised surface vs flat */
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ children, style, elevated = false, padded = true }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: elevated ? palette.surfaceHi : palette.surface },
        padded && styles.padded,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  padded: {
    padding: space.lg,
  },
});
