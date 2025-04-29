import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FitnessQuestionnaire from '../components/FitnessQuestionnaire';

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
      <FitnessQuestionnaire />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 