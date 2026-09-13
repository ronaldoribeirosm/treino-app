import { BlurView } from 'expo-blur';
import { Dumbbell, House, Salad, TrendingUp, Users, type LucideIcon } from 'lucide-react-native';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/ui/Text';
import { palette, radius, space, z } from '@/theme/tokens';

const TABS: { name: string; href: string; label: string; icon: LucideIcon }[] = [
  { name: 'index', href: '/', label: 'Home', icon: House },
  { name: 'treino', href: '/treino', label: 'Treino', icon: Dumbbell },
  { name: 'dieta', href: '/dieta', label: 'Dieta', icon: Salad },
  { name: 'progresso', href: '/progresso', label: 'Stats', icon: TrendingUp },
  { name: 'social', href: '/social', label: 'Squad', icon: Users },
];

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  // TabTriggers MUST be direct children of TabList (asChild target), else the
  // navigator registers no screens. BlurView + triggers are all direct children.
  return (
    <Tabs>
      <View style={styles.slot}>
        <TabSlot />
      </View>
      <TabList asChild>
        <View style={StyleSheet.flatten([styles.bar, { bottom: (insets.bottom || space.md) + space.sm }])}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
          )}
          {TABS.map((t) => (
            <TabTrigger key={t.name} name={t.name} href={t.href as never} asChild>
              <TabButton label={t.label} icon={t.icon} />
            </TabTrigger>
          ))}
          {/* registered so router.push('/perfil') works, but not shown in the bar */}
          <TabTrigger name="perfil" href={'/perfil' as never} asChild>
            <HiddenTab />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

const HiddenTab = forwardRef<View, TabTriggerSlotProps>(function HiddenTab(props, ref) {
  return <Pressable ref={ref} {...props} style={styles.hidden} />;
});

interface TabButtonProps extends TabTriggerSlotProps {
  label: string;
  icon: LucideIcon;
}

const TabButton = forwardRef<View, TabButtonProps>(function TabButton(
  { label, icon: Icon, isFocused, ...props },
  ref,
) {
  const tint = isFocused ? palette.lime : palette.inkFaint;
  return (
    <Pressable
      ref={ref}
      {...props}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}>
      {isFocused && <View style={styles.activePill} />}
      <Icon size={22} color={tint} strokeWidth={isFocused ? 2.6 : 2} />
      <Text variant="caption" color={tint} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    minHeight: 0,
  },
  bar: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    zIndex: z.tabbar,
    flexDirection: 'row',
    alignSelf: 'center',
    maxWidth: 528,
    marginHorizontal: 'auto',
    backgroundColor: Platform.OS === 'web' ? palette.surfaceHi : palette.surfaceHi + 'E6',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.lime,
  },
  label: {
    fontSize: 10,
  },
  hidden: {
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
});
