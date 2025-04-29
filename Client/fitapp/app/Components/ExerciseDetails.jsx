// ExerciseDetails.jsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { API } from '@/Utils/api';

const ExerciseDetails = ({ exercise }) => {
  if (!exercise) {
    return <Text style={styles.noData}>No exercise selected</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      
      {exercise.images && exercise.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {exercise.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: `${API}/v1/workout/${image}` }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Chip style={styles.categoryChip}>{exercise.category || 'Not specified'}</Chip>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Level:</Text>
          <Text style={styles.infoValue}>{exercise.level || 'Not specified'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Equipment:</Text>
          <Text style={styles.infoValue}>{exercise.equipment || 'None'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Force:</Text>
          <Text style={styles.infoValue}>{exercise.force || 'Not specified'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mechanic:</Text>
          <Text style={styles.infoValue}>{exercise.mechanic || 'Not specified'}</Text>
        </View>
      </View>
      
      <View style={styles.muscleSection}>
        <Text style={styles.sectionTitle}>Primary Muscles</Text>
        <View style={styles.muscleChips}>
          {exercise.primaryMuscles && exercise.primaryMuscles.map((muscle, index) => (
            <Chip key={index} style={styles.muscleChip}>{muscle}</Chip>
          ))}
          {(!exercise.primaryMuscles || exercise.primaryMuscles.length === 0) && (
            <Text style={styles.noDataText}>No primary muscles specified</Text>
          )}
        </View>
      </View>
      
      <View style={styles.muscleSection}>
        <Text style={styles.sectionTitle}>Secondary Muscles</Text>
        <View style={styles.muscleChips}>
          {exercise.secondaryMuscles && exercise.secondaryMuscles.map((muscle, index) => (
            <Chip key={index} style={styles.secondaryMuscleChip}>{muscle}</Chip>
          ))}
          {(!exercise.secondaryMuscles || exercise.secondaryMuscles.length === 0) && (
            <Text style={styles.noDataText}>No secondary muscles specified</Text>
          )}
        </View>
      </View>
      
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {exercise.instructions && exercise.instructions.map((step, index) => (
          <View key={index} style={styles.instructionStep}>
            <Text style={styles.stepNumber}>{index + 1}.</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
        {(!exercise.instructions || exercise.instructions.length === 0) && (
          <Text style={styles.noDataText}>No instructions available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noData: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  imageScroll: {
    height: 250,
    marginBottom: 16,
  },
  image: {
    width: 300,
    height: 250,
    marginRight: 10,
    borderRadius: 8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  muscleSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleChip: {
    margin: 4,
    backgroundColor: '#e0f7fa',
  },
  secondaryMuscleChip: {
    margin: 4,
    backgroundColor: '#fff9c4',
  },
  instructionsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    width: 24,
  },
  stepText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  categoryChip: {
    backgroundColor: '#e0f7fa',
  },
});

export default ExerciseDetails;