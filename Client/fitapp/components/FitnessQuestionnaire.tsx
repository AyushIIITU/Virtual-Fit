import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, Switch, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styled } from "nativewind";
import axios from 'axios';

const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledView = styled(View);
const StyledSwitch = styled(Switch);
const StyledTouchable = styled(TouchableOpacity);

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
  units: "metric" | "imperial";
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
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    units: "metric",
    fitnessGoals: [],
    targetWeight: "",
    fitnessLevel: "",
    exerciseFreq: "",
    pastWorkouts: [],
    dietType: "",
    allergies: "",
    dislikes: "",
    foodHabits: {
      caffeine: false,
      alcohol: false,
      dairy: false,
      gluten: false,
      sugar: false,
    },
    mealsPerDay: "",
    favoriteFoods: "",
    workoutTime: "",
    workoutDuration: "",
    routine: "",
    medicalConditions: "",
    medications: "",
    injuries: "",
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
    <StyledView className="mb-4">
      <StyledText className="font-bold text-base text-gray-800">{label}</StyledText>
      <StyledTextInput
        className="border border-gray-300 rounded-lg mt-2 p-2 text-gray-900"
        multiline={multiline}
        value={form[field] as string}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
      />
    </StyledView>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <StyledView className="mb-8">
      <StyledText className="text-xl font-bold text-blue-700 mb-3">{title}</StyledText>
      {children}
    </StyledView>
  );

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/fitness-profile', form, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
    <ScrollView className="p-5 bg-white">
      <Section title="👤 Basic Info">
        <Input label="Name" field="name" />
        <Input label="Age" field="age" />
        <Input label="Gender" field="gender" />
        <Input label="Height (cm or ft)" field="height" />
        <Input label="Weight (kg or lbs)" field="weight" />
        <StyledText className="font-bold text-gray-800">Units</StyledText>
        <Picker
          selectedValue={form.units}
          onValueChange={(value) => setForm({ ...form, units: value as "metric" | "imperial" })}
          style={{ marginTop: 8 }}
        >
          <Picker.Item label="Metric (kg, cm)" value="metric" />
          <Picker.Item label="Imperial (lbs, ft)" value="imperial" />
        </Picker>
      </Section>

      <Section title="🎯 Fitness Goals">
        {["Lose weight", "Gain muscle", "Improve endurance"].map((goal) => (
          <StyledTouchable key={goal} onPress={() => toggleItem("fitnessGoals", goal)}>
            <StyledText className="text-gray-700 mb-2">🔘 {goal}</StyledText>
          </StyledTouchable>
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
          <StyledView key={key} className="flex-row items-center my-1">
            <StyledSwitch
              value={form.foodHabits[key as keyof FoodHabits]}
              onValueChange={() => toggleFood(key as keyof FoodHabits)}
            />
            <StyledText className="ml-2 capitalize text-gray-700">{key}</StyledText>
          </StyledView>
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
        <StyledView className="flex-row items-center mt-2">
          <StyledSwitch
            value={form.reminders}
            onValueChange={(val) => setForm({ ...form, reminders: val })}
          />
          <StyledText className="ml-2 text-gray-700">Enable motivational reminders</StyledText>
        </StyledView>
      </Section>

      <StyledTouchable
        onPress={handleSubmit}
        className="bg-blue-600 py-3 px-4 rounded-xl mt-4 items-center"
      >
        <StyledText className="text-white font-bold text-lg">Submit</StyledText>
      </StyledTouchable>
    </ScrollView>
  );
};

export default FitnessQuestionnaire; 