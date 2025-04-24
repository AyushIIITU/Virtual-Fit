// ExerciseDetails.jsx
import React from "react";
import { View, Text, ScrollView, ScrollViewBase } from "react-native";
import ImageCarousel from "./ImageCarousel";

const ExerciseDetails = ({ exercise }) => {
    console.log(exercise.name,exercise.images);
  if (!exercise) return null;
  return (
    <View className="bg-white p-4 rounded-2xl shadow">
      <Text className="text-xl font-bold mb-2">{exercise.name}</Text>
      <Text className="text-gray-600 mb-1">Level: {exercise.level}</Text>
      <Text className="text-gray-600 mb-1">Equipment: {exercise.equipment}</Text>
      <Text className="text-gray-600 mb-1">Primary: {exercise.primaryMuscles.join(", ")}</Text>
      <Text className="text-gray-600 mb-2">Secondary: {exercise.secondaryMuscles.join(", ")}</Text>

      <ImageCarousel imagePaths={exercise.images.map(img => `${img}`)} />

      <Text className="font-semibold mt-2">Instructions:</Text>
      {exercise.instructions.map((inst, idx) => (
        <Text key={idx} className="text-sm text-gray-700 mb-1">
          • {inst}
        </Text>
      ))}
    </View>
  );
};

export default ExerciseDetails;