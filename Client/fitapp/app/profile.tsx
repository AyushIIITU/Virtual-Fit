import React from 'react';
import { View } from 'react-native';
import FitnessQuestionnaire from '../components/FitnessQuestionnaire';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white">
      <FitnessQuestionnaire />
    </View>
  );
} 