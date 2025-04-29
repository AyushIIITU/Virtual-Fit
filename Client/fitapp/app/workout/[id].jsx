import React from 'react';
import { View, StyleSheet } from 'react-native';
import WorkoutDetail from '../Components/WorkoutDetail';

export default function WorkoutDetailScreen() {
  return (
    <View style={styles.container}>
      <WorkoutDetail />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 