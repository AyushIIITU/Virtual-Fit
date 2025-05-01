import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
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
  
  // Handle the UI loading state
  if (!loaded) {
    return null;
  }
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    const prepare = async () => {
      try {
        // Check if user is authenticated
        const token = await AsyncStorage.getItem('userToken');
        if (!token && segments[0] === '(tabs)') {
          // If not authenticated and trying to access tabs, redirect to auth
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };
    
    prepare();
  }, []);
  
  // Show a loading indicator until the app is ready
  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="+not-found" options={{ headerShown: true }} />
    </Stack>
  );
}
