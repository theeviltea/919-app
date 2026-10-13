import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';
import { EmployerProvider } from '@/data/employer';
import { SessionProvider } from '@/data/session';
import { SeekerProvider } from '@/data/seeker';
import { SignupProvider } from '@/data/signup';
import { PostGateProvider } from '@/features/post/gate';
import { fontAssets, ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

function Root() {
  const { c, scheme } = useTheme();
  return (
    <ToastProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <PostGateProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.back } }} />
      </PostGateProvider>
    </ToastProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SessionProvider>
            <SignupProvider>
              <SeekerProvider>
                <EmployerProvider>
                  <Root />
                </EmployerProvider>
              </SeekerProvider>
            </SignupProvider>
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
