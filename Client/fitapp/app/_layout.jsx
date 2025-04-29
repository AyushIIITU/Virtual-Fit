import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { View } from 'react-native';
import "../global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isFirstTime, setIsFirstTime] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkFirstTime();
  }, []);

  useEffect(() => {
    if (!isFirstTime && segments[0] === '(auth)') {
      router.replace('/(tabs)');
    } 
    else if (isFirstTime && segments[0] !== '(auth)') {
      router.replace('/(auth)/onboarding');
    }
  }, [isFirstTime, segments]);

  const checkFirstTime = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      setIsFirstTime(!hasCompletedOnboarding);
    } catch (error) {
      console.error('Error checking first time status:', error);
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="+not-found" options={{ headerShown: true }} />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}
