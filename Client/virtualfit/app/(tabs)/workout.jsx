// screens/WorkoutScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity
} from 'react-native';

export default function WorkoutScreen({ route, navigation }) {
  const { workout } = route.params;
  
  // Sample exercises
  const exercises = [
    { id: 1, name: 'Jumping Jacks', duration: '60 sec', sets: 1 },
    { id: 2, name: 'Push-ups', reps: '12 reps', sets: 3 },
    { id: 3, name: 'Squats', reps: '15 reps', sets: 3 },
    { id: 4, name: 'Lunges', reps: '10 reps each leg', sets: 3 },
    { id: 5, name: 'Plank', duration: '45 sec', sets: 3 },
    { id: 6, name: 'Mountain Climbers', duration: '30 sec', sets: 3 },
    { id: 7, name: 'Burpees', reps: '8 reps', sets: 3 },
    { id: 8, name: 'Cool down stretch', duration: '2 min', sets: 1 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: `https://via.placeholder.com/400x200?text=${workout.name}` }}
        style={styles.headerImage}
      />
      
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{workout.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Level</Text>
            <Text style={styles.metaValue}>{workout.level}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Calories</Text>
            <Text style={styles.metaValue}>~250</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          This {workout.name.toLowerCase()} targets all major muscle groups and is designed to improve strength, endurance, and flexibility. Follow the exercises in order, with 30-60 seconds rest between sets.
        </Text>
      </View>
      
      <View style={styles.exercisesContainer}>
        <Text style={styles.exercisesTitle}>Exercises</Text>
        
        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseItem}>
            <View style={styles.exerciseNumberContainer}>
              <Text style={styles.exerciseNumber}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseInstructions}>
                {exercise.sets} {exercise.sets > 1 ? 'sets' : 'set'} • {exercise.reps || exercise.duration}
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  workoutInfo: {
    padding: 20,
  },
  workoutName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutMeta: {
    flexDirection: 'row',
    marginTop: 15,
  },
  metaItem: {
    marginRight: 25,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
  },
  metaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  descriptionContainer: {
    padding: 20,
    paddingTop: 0,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  exercisesContainer: {
    padding: 20,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
