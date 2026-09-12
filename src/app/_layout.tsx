import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/lib/useAuth';
import { useStore } from '@/store/useStore';
import { Toaster } from '@/ui/Toast';
import { useAppFonts } from '@/theme/useAppFonts';
import { palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const hydrated = useStore((s) => s.hydrated);
  const { session, loading: authLoading } = useAuth();
  const ready = fontsLoaded && hydrated && !authLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: palette.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {session ? <AppTabs /> : <AuthScreen />}
        <Toaster />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
