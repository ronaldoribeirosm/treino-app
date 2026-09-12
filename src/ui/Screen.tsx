import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAX_CONTENT_WIDTH, palette, space } from '@/theme/tokens';

// On web, expo-router's per-screen wrapper uses flex-basis:auto and won't shrink
// to its bounded parent, so a flex:1 ScrollView never gets a scrollable height.
// Pin the height to the viewport (dvh handles mobile browser chrome). Native uses flex.
const webFill = Platform.OS === 'web' ? ({ height: '100dvh', maxHeight: '100dvh' } as ViewStyle) : null;

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  /** extra bottom padding so content clears the floating tab bar */
  tabBarInset?: boolean;
}

const TAB_BAR_CLEARANCE = 96;

export function Screen({ children, scroll = true, contentStyle, tabBarInset = true }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const pad: ViewStyle = {
    paddingTop: insets.top + space.sm,
    paddingBottom: (tabBarInset ? TAB_BAR_CLEARANCE : space.xl) + insets.bottom,
    paddingHorizontal: space.lg,
  };

  if (!scroll) {
    return (
      <View style={[styles.root, webFill]}>
        <View style={[styles.inner, pad, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, webFill]}
      contentContainerStyle={[styles.inner, pad, contentStyle]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
});
