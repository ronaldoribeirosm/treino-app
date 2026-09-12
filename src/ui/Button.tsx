import { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';

import { Text } from './Text';
import { PressableScale } from './PressableScale';
import { palette, radius, space } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const bg: Record<Variant, string> = {
  primary: palette.lime,
  secondary: palette.surfaceHi,
  ghost: 'transparent',
  danger: palette.danger,
};

const fg: Record<Variant, string> = {
  primary: palette.bg,
  secondary: palette.ink,
  ghost: palette.ink,
  danger: '#fff',
};

const heights: Record<Size, number> = { lg: 56, md: 48, sm: 38 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const tint = fg[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          height: heights[size],
          backgroundColor: bg[variant],
          borderColor: variant === 'ghost' ? palette.borderStrong : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: fullWidth ? space.lg : space.xxl,
        },
        style,
      ]}>
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={tint} size="small" />
        ) : (
          <>
            {Icon ? <Icon size={size === 'sm' ? 16 : 20} color={tint} strokeWidth={2.5} /> : null}
            <Text variant={size === 'sm' ? 'label' : 'subtitle'} color={tint}>
              {label}
            </Text>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
