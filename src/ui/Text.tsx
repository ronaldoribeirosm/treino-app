import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

import { font, palette } from '@/theme/tokens';

type Variant =
  | 'hero' // Bebas — giant hero numbers/titles
  | 'display' // Bebas — section titles
  | 'displaySm' // Bebas — small labels, uppercase
  | 'title' // Inter extra-bold
  | 'subtitle' // Inter bold
  | 'body' // Inter regular
  | 'bodyMd' // Inter medium
  | 'label' // Inter semibold small
  | 'caption' // Inter — muted small
  | 'stat' // Inter extra-bold tabular — data values
  | 'mono'; // Space Mono — scoreboard / xp

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

export function Text({ variant = 'body', color, center, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[
        styles[variant],
        color ? { color } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
    />
  );
}

const tnum = { fontVariant: ['tabular-nums'] as const };

const styles = StyleSheet.create({
  hero: {
    fontFamily: font.display,
    fontSize: 64,
    lineHeight: 62,
    letterSpacing: 0.5,
    color: palette.ink,
  },
  display: {
    fontFamily: font.display,
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: 0.6,
    color: palette.ink,
  },
  displaySm: {
    fontFamily: font.display,
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 1,
    color: palette.ink,
  },
  title: {
    fontFamily: font.black,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: palette.ink,
  },
  subtitle: {
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: palette.ink,
  },
  body: {
    fontFamily: font.body,
    fontSize: 15,
    lineHeight: 22,
    color: palette.ink,
  },
  bodyMd: {
    fontFamily: font.medium,
    fontSize: 15,
    lineHeight: 22,
    color: palette.ink,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: palette.ink,
  },
  caption: {
    fontFamily: font.medium,
    fontSize: 12,
    lineHeight: 16,
    color: palette.inkMuted,
  },
  stat: {
    fontFamily: font.black,
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: palette.ink,
    ...tnum,
  },
  mono: {
    fontFamily: font.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: palette.inkMuted,
    ...tnum,
  },
});
