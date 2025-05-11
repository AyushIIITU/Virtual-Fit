import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { API } from '@/Utils/api';

const WorkoutDetail = () => {
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/v1/workout/${id}`);
        const data = await response.json();
        setWorkout(data);
      } catch (error) {
        console.error('Error fetching workout:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style="flex-1 bg-gray-100">  
      <Image source={{ uri: workout.Images[0] }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{workout.Name}</Text>
        
        <View style={styles.chipContainer}>
          <Chip style={styles.chip}>{workout.Level}</Chip>
          <Chip style={styles.chip}>{workout.Equipment}</Chip>
          <Chip style={styles.chip}>{workout.Force}</Chip>
        </View>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Primary Muscles</Text>
            <View style={styles.muscleContainer}>
              {workout.PrimaryMuscles.map((muscle, index) => (
                <Chip key={index} style={styles.muscleChip}>{muscle}</Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Secondary Muscles</Text>
            <View style={styles.muscleContainer}>
              {workout.SecondaryMuscles.map((muscle, index) => (
                <Chip key={index} style={styles.muscleChip}>{muscle}</Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructions}>{workout.Instructions}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Mechanic:</Text>
              <Text style={styles.infoText}>{workout.Mechanic}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoText}>{workout.Category}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  muscleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 100,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
});

export default WorkoutDetail; 