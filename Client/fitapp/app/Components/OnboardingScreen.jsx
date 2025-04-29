import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MultiSelect from './MultiSelect';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: new Date(),
    gender: '',
    height: '',
    weight: '',
    region: '',
    goals: [],
    dietary_restrictions: [],
    daily_calorie_intake: '',
    daily_protein_intake: '',
    foods_to_avoid: [],
    preferred_meal_frequency: '',
    current_fitness_level: '',
    health_considerations: [],
    interested_activities: [],
    days_per_week: '',
    medical_conditions: [],
    food_allergies: [],
  });

  const options = {
    goals: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Endurance', 'Flexibility'],
    dietary_restrictions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'],
    foods_to_avoid: ['Processed Sugar', 'Fast Food', 'Red Meat', 'Dairy', 'Gluten', 'Alcohol'],
    current_fitness_level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    health_considerations: ['Low Back Pain', 'Joint Issues', 'Heart Condition', 'Diabetes', 'None'],
    interested_activities: ['Running', 'Weight Training', 'Yoga', 'Swimming', 'Cycling', 'HIIT'],
    medical_conditions: ['None', 'Asthma', 'Heart Disease', 'Diabetes', 'Hypertension'],
    food_allergies: ['None', 'Peanuts', 'Tree Nuts', 'Shellfish', 'Dairy', 'Eggs'],
  };

  const steps = [
    {
      title: 'Basic Information',
      fields: ['name', 'email', 'password', 'dob', 'gender'],
    },
    {
      title: 'Physical Details',
      fields: ['height', 'weight', 'region'],
    },
    {
      title: 'Fitness Goals',
      fields: ['goals', 'current_fitness_level', 'days_per_week'],
    },
    {
      title: 'Dietary Preferences',
      fields: ['dietary_restrictions', 'daily_calorie_intake', 'daily_protein_intake', 'foods_to_avoid'],
    },
    {
      title: 'Health & Activities',
      fields: ['health_considerations', 'interested_activities', 'medical_conditions', 'food_allergies'],
    },
  ];

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        router.replace('/(tabs)');
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderStep = () => {
    const currentStepData = steps[currentStep];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{currentStepData.title}</Text>
        {currentStepData.fields.map((field) => (
          <View key={field} style={styles.fieldContainer}>
            {renderField(field)}
          </View>
        ))}
      </View>
    );
  };

  const renderField = (field) => {
    switch (field) {
      case 'name':
        return (
          <TextInput
            label="Full Name"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
            style={styles.input}
          />
        );
      case 'email':
        return (
          <TextInput
            label="Email"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
            keyboardType="email-address"
            style={styles.input}
          />
        );
      case 'password':
        return (
          <TextInput
            label="Password"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
            secureTextEntry
            style={styles.input}
          />
        );
      case 'dob':
        return (
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <DateTimePicker
              value={formData[field]}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setFormData({ ...formData, [field]: selectedDate || formData[field] });
              }}
            />
          </View>
        );
      case 'gender':
        return (
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Gender</Text>
            <Picker
              selectedValue={formData[field]}
              onValueChange={(value) => setFormData({ ...formData, [field]: value })}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        );
      case 'height':
        return (
          <TextInput
            label="Height (cm)"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
            keyboardType="numeric"
            style={styles.input}
          />
        );
      case 'weight':
        return (
          <TextInput
            label="Weight (kg)"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
            keyboardType="numeric"
            style={styles.input}
          />
        );
      case 'region':
        return (
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Region</Text>
            <Picker
              selectedValue={formData[field]}
              onValueChange={(value) => setFormData({ ...formData, [field]: value })}
            >
              <Picker.Item label="Select Region" value="" />
              <Picker.Item label="North America" value="North America" />
              <Picker.Item label="Europe" value="Europe" />
              <Picker.Item label="Asia" value="Asia" />
              <Picker.Item label="Africa" value="Africa" />
              <Picker.Item label="South America" value="South America" />
              <Picker.Item label="Oceania" value="Oceania" />
            </Picker>
          </View>
        );
      case 'daily_calorie_intake':
        return (
          <TextInput
            label="Daily Calorie Intake"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
            keyboardType="numeric"
            style={styles.input}
          />
        );
      case 'daily_protein_intake':
        return (
          <TextInput
            label="Daily Protein Intake (g)"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
            keyboardType="numeric"
            style={styles.input}
          />
        );
      case 'preferred_meal_frequency':
        return (
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Preferred Meal Frequency</Text>
            <Picker
              selectedValue={formData[field]}
              onValueChange={(value) => setFormData({ ...formData, [field]: value })}
            >
              <Picker.Item label="Select Frequency" value="" />
              <Picker.Item label="3 meals" value="3" />
              <Picker.Item label="4 meals" value="4" />
              <Picker.Item label="5 meals" value="5" />
              <Picker.Item label="6 meals" value="6" />
            </Picker>
          </View>
        );
      case 'days_per_week':
        return (
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Days per Week</Text>
            <Picker
              selectedValue={formData[field]}
              onValueChange={(value) => setFormData({ ...formData, [field]: value })}
            >
              <Picker.Item label="Select Days" value="" />
              <Picker.Item label="3 days" value="3" />
              <Picker.Item label="4 days" value="4" />
              <Picker.Item label="5 days" value="5" />
              <Picker.Item label="6 days" value="6" />
            </Picker>
          </View>
        );
      case 'goals':
      case 'dietary_restrictions':
      case 'foods_to_avoid':
      case 'health_considerations':
      case 'interested_activities':
      case 'medical_conditions':
      case 'food_allergies':
        return (
          <MultiSelect
            label={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            options={options[field]}
            selectedValues={formData[field]}
            onValueChange={(values) => setFormData({ ...formData, [field]: values })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                currentStep >= index && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        {renderStep()}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={() => setCurrentStep(currentStep - 1)}
            style={styles.button}
          >
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button
            mode="contained"
            onPress={() => setCurrentStep(currentStep + 1)}
            style={styles.button}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
          >
            Complete Registration
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
  },
  dateContainer: {
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default OnboardingScreen; 