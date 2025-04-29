import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingScreen from '../Components/OnboardingScreen';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <OnboardingScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 