import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function Logo({ size = 100, showText = true }) {
  return (
    <View style={styles.container}>
      <View style={[styles.logoCircle, { width: size, height: size }]}>
        <FontAwesome5 name="dumbbell" size={size * 0.5} color="#4A90E2" />
      </View>
      {showText && (
        <>
          <Text style={styles.appName}>VirtualFit</Text>
          <Text style={styles.tagline}>Your personal fitness journey starts here</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoCircle: {
    backgroundColor: '#E8F2FF',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
}); 