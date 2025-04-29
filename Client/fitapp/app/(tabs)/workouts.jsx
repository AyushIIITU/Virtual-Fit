import React from 'react';
import { View, StyleSheet } from 'react-native';
import WorkoutList from '../Components/WorkoutList';

export default function WorkoutsScreen() {
  return (
    <View style={styles.container}>
      <WorkoutList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 