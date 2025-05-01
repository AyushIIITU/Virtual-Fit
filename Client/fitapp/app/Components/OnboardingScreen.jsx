import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MultiSelect from './MultiSelect';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/Utils/api';

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: new Date(),
    gender: '',
    height: 0,
    weight: 0,
    region: '',
    goals: [],
    dietary_restrictions: [],
    daily_calorie_intake: 0,
    daily_protein_intake: 0,
    foods_to_avoid: [],
    preferred_meal_frequency: 0,
    current_fitness_level: '',
    health_considerations: [],
    interested_activities: [],
    days_per_week: 0,
    medical_conditions: [],
    food_allergies: [],
    exercises: [], // Placeholder for exercises (if needed)
  });

  const options = {
    goals: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Endurance', 'Flexibility'],
    dietary_restrictions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'],
    foods_to_avoid: ['Processed Sugar', 'Fast Food', 'Red Meat', 'Dairy', 'Gluten', 'Alcohol'],
    current_fitness_level: ['Beginner', 'Intermediate', 'Advanced'],
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
      fields: ['dietary_restrictions', 'daily_calorie_intake', 'daily_protein_intake', 'foods_to_avoid', 'preferred_meal_frequency'],
    },
    {
      title: 'Health & Activities',
      fields: ['health_considerations', 'interested_activities', 'medical_conditions', 'food_allergies'],
    },
  ];

  const requiredFields = {
    name: 'required',
    email: 'required,email',
    password: 'required,min=8',
    dob: 'required',
    gender: 'required,oneof=Male Female Other',
    height: 'required,gt=0',
    weight: 'required,gt=0',
    region: 'required',
    goals: 'required,min=1',
    daily_calorie_intake: 'required,min=1000,max=5000',
    daily_protein_intake: 'required,min=30,max=500',
    preferred_meal_frequency: 'required,min=1,max=6',
    current_fitness_level: 'required,oneof=Beginner Intermediate Advanced',
    days_per_week: 'required,min=1,max=7',
  };

  const validateField = (field, value) => {
    const rules = requiredFields[field]?.split(',');
    let error = '';

    if (rules?.includes('required') && (!value || (Array.isArray(value) && value.length === 0))) {
      error = 'This field is required';
    } else if (rules?.includes('email') && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Invalid email address';
    } else if (rules?.find(r => r.startsWith('min='))) {
      const min = parseInt(rules.find(r => r.startsWith('min=')).split('=')[1]);
      if (field === 'password' && value.length < min) {
        error = `Minimum ${min} characters required`;
      } else if (typeof value === 'number' && value < min) {
        error = `Minimum value is ${min}`;
      } else if (Array.isArray(value) && value.length < min) {
        error = `Select at least ${min} option(s)`;
      }
    } else if (rules?.find(r => r.startsWith('max='))) {
      const max = parseInt(rules.find(r => r.startsWith('max=')).split('=')[1]);
      if (typeof value === 'number' && value > max) {
        error = `Maximum value is ${max}`;
      }
    } else if (rules?.find(r => r.startsWith('oneof='))) {
      const validOptions = rules.find(r => r.startsWith('oneof=')).split('=')[1].split(' ');
      if (value && !validOptions.includes(value)) {
        error = `Invalid selection`;
      }
    }
    return error;
  };

  const validateStep = () => {
    const currentStepFields = steps[currentStep].fields;
    const newErrors = {};

    currentStepFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const response = await fetch(`${API}/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dob: formData.dob.toISOString(), // Convert date to ISO string for API
        }),
      });

      if (response.ok) {
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      } else {
        const errorData = await response.json();
        setErrors({ global: errorData.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Network error:', error);
      console.error('Network error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      setErrors({ global: `Network error: ${error.message}` });
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
            {errors[field] && <HelperText type="error">{errors[field]}</HelperText>}
          </View>
        ))}
        {errors.global && <HelperText type="error">{errors.global}</HelperText>}
      </View>
    );
  };

  const renderField = (field) => {
    const isRequired = requiredFields[field];
    const labelStyle = [styles.label, isRequired && styles.requiredLabel];

    switch (field) {
      case 'name':
      case 'email':
      case 'password':
        return (
          <>
            <Text style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}{isRequired && ' *'}</Text>
            <TextInput
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChangeText={(text) => setFormData({ ...formData, [field]: text })}
              keyboardType={field === 'email' ? 'email-address' : 'default'}
              secureTextEntry={field === 'password'}
              style={[styles.input, errors[field] && styles.inputError]}
              error={!!errors[field]}
            />
          </>
        );
      case 'dob':
        return (
          <View style={styles.dateContainer}>
            <Text style={labelStyle}>Date of Birth{isRequired && ' *'}</Text>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={formData[field]}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setFormData({ ...formData, [field]: selectedDate || formData[field] });
                  setErrors({ ...errors, [field]: validateField(field, selectedDate) });
                }}
                style={errors[field] && styles.inputError}
              />
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    label="Date of Birth"
                    value={formData[field].toLocaleDateString()}
                    editable={false}
                    style={[styles.input, errors[field] && styles.inputError]}
                  />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData[field]}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setFormData({ ...formData, [field]: selectedDate });
                        setErrors({ ...errors, [field]: validateField(field, selectedDate) });
                      }
                    }}
                  />
                )}
              </>
            )}
          </View>
        );
      case 'gender':
      case 'region':
      case 'current_fitness_level':
        return (
          <View style={styles.pickerContainer}>
            <Text style={labelStyle}>{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}{isRequired && ' *'}</Text>
            <Picker
              selectedValue={formData[field]}
              onValueChange={(value) => {
                setFormData({ ...formData, [field]: value });
                setErrors({ ...errors, [field]: validateField(field, value) });
              }}
              style={[styles.picker, errors[field] && styles.inputError]}
            >
              <Picker.Item label={`Select ${field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`} value="" />
              {(field === 'gender' ? 
                ['Male', 'Female', 'Other'] : 
                field === 'region' ? 
                ['North America', 'Europe', 'Asia', 'Africa', 'South America', 'Oceania'] : 
                ['Beginner', 'Intermediate', 'Advanced']
              ).map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        );
      case 'height':
      case 'weight':
      case 'daily_calorie_intake':
      case 'daily_protein_intake':
        return (
          <>
            <Text style={labelStyle}>{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}{isRequired && ' *'}</Text>
            <TextInput
              label={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              value={formData[field] ? formData[field].toString() : ''}
              onChangeText={(text) => {
                const value = text ? parseFloat(text) : 0;
                setFormData({ ...formData, [field]: value });
                setErrors({ ...errors, [field]: validateField(field, value) });
              }}
              keyboardType="numeric"
              style={[styles.input, errors[field] && styles.inputError]}
              error={!!errors[field]}
            />
          </>
        );
      case 'preferred_meal_frequency':
      case 'days_per_week':
        return (
          <View style={styles.pickerContainer}>
            <Text style={labelStyle}>{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}{isRequired && ' *'}</Text>
            <Picker
              selectedValue={formData[field] ? formData[field].toString() : ''}
              onValueChange={(value) => {
                const numValue = value ? parseInt(value) : 0;
                setFormData({ ...formData, [field]: numValue });
                setErrors({ ...errors, [field]: validateField(field, numValue) });
              }}
              style={[styles.picker, errors[field] && styles.inputError]}
            >
              <Picker.Item label={`Select ${field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`} value="" />
              {(field === 'preferred_meal_frequency' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7]).map(num => (
                <Picker.Item key={num} label={`${num} ${field === 'preferred_meal_frequency' ? 'meals' : 'days'}`} value={num.toString()} />
              ))}
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
          <>
            <Text style={labelStyle}>{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}{isRequired && ' *'}</Text>
            <MultiSelect
              label={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              options={options[field]}
              selectedValues={formData[field]}
              onValueChange={(values) => {
                setFormData({ ...formData, [field]: values });
                setErrors({ ...errors, [field]: validateField(field, values) });
              }}
              error={!!errors[field]}
            />
          </>
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
            onPress={() => {
              if (validateStep()) {
                setCurrentStep(currentStep + 1);
              }
            }}
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
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  dateContainer: {
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  requiredLabel: {
    color: '#d32f2f',
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