import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { queryClient } from '../src/lib/queryClient';
import {
  useAuthStore,
  useIsInitialized,
  useIsAuthenticated,
  useIsAdmin,
} from '../src/store/authStore';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';
import { colors } from '../src/theme/colors';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const isInitialized = useIsInitialized();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    } else if (inAdminGroup && !isAdmin) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, isAdmin, segments, isInitialized, router]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const isInitialized = useIsInitialized();
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const init = async () => {
      await initialize();
      await SplashScreen.hideAsync();
    };

    init();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner fullScreen text="Caricamento..." />
      </View>
    );
  }

  return (
    <AuthGuard>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </AuthGuard>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
