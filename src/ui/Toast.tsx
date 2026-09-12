import { AnimatePresence, MotiView } from 'moti';
import { Check, Info, TriangleAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';
import { useStore, type ToastTone } from '@/store/useStore';
import { palette, radius, space, z } from '@/theme/tokens';

const toneColor: Record<ToastTone, string> = {
  good: palette.lime,
  info: palette.cyan,
  warn: palette.warning,
};
const toneIcon = { good: Check, info: Info, warn: TriangleAlert };

export function Toaster() {
  const toast = useStore((s) => s.toast);
  const hide = useStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, 2600);
    return () => clearTimeout(t);
  }, [toast, hide]);

  const color = toast ? toneColor[toast.tone] : palette.lime;
  const Icon = toast ? toneIcon[toast.tone] : Check;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + space.sm }]}>
      <AnimatePresence>
        {toast && (
          <MotiView
            key={toast.id}
            from={{ opacity: 0, translateY: -24, scale: 0.96 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -16, scale: 0.98 }}
            transition={{ type: 'timing', duration: 260 }}
            style={[styles.toast, { borderColor: color + '66' }]}>
            <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
              <Icon size={16} color={color} strokeWidth={2.6} />
            </View>
            <Text variant="bodyMd" style={styles.msg}>
              {toast.msg}
            </Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: z.toast,
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: palette.surfaceHi,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msg: {
    flexShrink: 1,
  },
});
