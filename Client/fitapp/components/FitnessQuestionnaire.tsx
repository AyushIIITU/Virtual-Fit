import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces
interface FoodHabits {
  caffeine: boolean;
  alcohol: boolean;
  dairy: boolean;
  gluten: boolean;
  sugar: boolean;
}

interface FitnessForm {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  units: 'metric' | 'imperial';
  fitnessGoals: string[];
  targetWeight: string;
  fitnessLevel: string;
  exerciseFreq: string;
  pastWorkouts: string[];
  dietType: string;
  allergies: string;
  dislikes: string;
  foodHabits: FoodHabits;
  mealsPerDay: string;
  favoriteFoods: string;
  workoutTime: string;
  workoutDuration: string;
  routine: string;
  medicalConditions: string;
  medications: string;
  injuries: string;
  equipment: string[];
  reminders: boolean;
}

const FitnessQuestionnaire = () => {
  const [form, setForm] = useState<FitnessForm>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    units: 'metric',
    fitnessGoals: [],
    targetWeight: '',
    fitnessLevel: '',
    exerciseFreq: '',
    pastWorkouts: [],
    dietType: '',
    allergies: '',
    dislikes: '',
    foodHabits: {
      caffeine: false,
      alcohol: false,
      dairy: false,
      gluten: false,
      sugar: false,
    },
    mealsPerDay: '',
    favoriteFoods: '',
    workoutTime: '',
    workoutDuration: '',
    routine: '',
    medicalConditions: '',
    medications: '',
    injuries: '',
    equipment: [],
    reminders: false,
  });

  const toggleItem = (field: keyof FitnessForm, value: string) => {
    if (Array.isArray(form[field])) {
      setForm((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).includes(value)
          ? (prev[field] as string[]).filter((v) => v !== value)
          : [...(prev[field] as string[]), value],
      }));
    }
  };

  const toggleFood = (key: keyof FoodHabits) => {
    setForm((prev) => ({
      ...prev,
      foodHabits: { ...prev.foodHabits, [key]: !prev.foodHabits[key] },
    }));
  };

  const Input = ({ label, field, multiline = false }: { label: string; field: keyof FitnessForm; multiline?: boolean }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.textInput}
        multiline={multiline}
        value={form[field] as string}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
      />
    </View>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/fitness-profile', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Profile saved successfully:', response.data);
      // Add navigation or success message here
    } catch (error) {
      console.error('Error saving profile:', error);
      // Add error handling here
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Section title="👤 Basic Info">
        <Input label="Name" field="name" />
        <Input label="Age" field="age" />
        <Input label="Gender" field="gender" />
        <Input label="Height (cm or ft)" field="height" />
        <Input label="Weight (kg or lbs)" field="weight" />
        <Text style={styles.label}>Units</Text>
        <Picker
          selectedValue={form.units}
          onValueChange={(value) => setForm({ ...form, units: value as 'metric' | 'imperial' })}
          style={styles.picker}
        >
          <Picker.Item label="Metric (kg, cm)" value="metric" />
          <Picker.Item label="Imperial (lbs, ft)" value="imperial" />
        </Picker>
      </Section>

      <Section title="🎯 Fitness Goals">
        {['Lose weight', 'Gain muscle', 'Improve endurance'].map((goal) => (
          <TouchableOpacity key={goal} onPress={() => toggleItem('fitnessGoals', goal)}>
            <Text style={styles.optionText}>🔘 {goal}</Text>
          </TouchableOpacity>
        ))}
        <Input label="Target Weight (optional)" field="targetWeight" />
      </Section>

      <Section title="🧘 Fitness Background">
        <Input label="Fitness Level" field="fitnessLevel" />
        <Input label="Exercise Frequency" field="exerciseFreq" />
        <Input label="Previous Workouts" field="pastWorkouts" />
      </Section>

      <Section title="🍽️ Diet Preferences">
        <Input label="Current Eating Style" field="dietType" />
        <Input label="Food Allergies" field="allergies" />
        <Input label="Foods to Avoid" field="dislikes" />
        {Object.keys(form.foodHabits).map((key) => (
          <View key={key} style={styles.switchContainer}>
            <Switch
              value={form.foodHabits[key as keyof FoodHabits]}
              onValueChange={() => toggleFood(key as keyof FoodHabits)}
            />
            <Text style={styles.switchLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          </View>
        ))}
        <Input label="Meals per Day" field="mealsPerDay" />
        <Input label="Favorite Foods" field="favoriteFoods" />
      </Section>

      <Section title="⏱️ Lifestyle">
        <Input label="Daily Routine" field="routine" multiline />
        <Input label="Preferred Workout Time" field="workoutTime" />
        <Input label="Workout Duration" field="workoutDuration" />
      </Section>

      <Section title="⚕️ Health Info">
        <Input label="Medical Conditions" field="medicalConditions" />
        <Input label="Medications" field="medications" />
        <Input label="Injuries" field="injuries" />
      </Section>

      <Section title="🏋️ Equipment & Motivation">
        <Input label="Available Equipment" field="equipment" />
        <View style={styles.switchContainer}>
          <Switch
            value={form.reminders}
            onValueChange={(val) => setForm({ ...form, reminders: val })}
          />
          <Text style={styles.switchLabel}>Enable motivational reminders</Text>
        </View>
      </Section>

      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.submitButton}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF', // blue-700
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#111827', // gray-900
  },
  picker: {
    marginTop: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#4B5563', // gray-700
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4B5563', // gray-700
  },
  submitButton: {
    backgroundColor: '#2563EB', // blue-600
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FitnessQuestionnaire;