import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,FlatList
} from 'react-native';
// import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import SearchBar from "@/app/Components/SearchBar";
import ExerciseDetails from "@/app/Components/ExerciseDetails";
import exercisesData from "@/assets/exercises.json";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [query, setQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filteredExercises, setFilteredExercises] = useState([]);

  useEffect(() => {
    const results = exercisesData.filter((exercise) =>
      exercise.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExercises(results);
  }, [query]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          setUserName(email.split('@')[0]);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      router.replace('/login');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {userName || 'Fitness Enthusiast'}!</Text>
          <Text style={styles.subtitle}>Ready for your workout?</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>

      {selectedExercise ? (
        <>
            <View className="flex-1 bg-gray-100 p-4">
            <TouchableOpacity
            className="mt-4 bg-red-500 py-2 px-4 rounded-2xl "
            onPress={() => setSelectedExercise(null)}
          >
            <Text className="text-white text-center">{'<-- Back to list'}</Text>
          </TouchableOpacity>
            {/* <Text className="text-xl font-bold mb-2">{selectedExercise.name}</Text> */}
          <ExerciseDetails exercise={selectedExercise} />
          
            </View>
        </>
      ) : (
        <View className="flex-1 bg-gray-100 p-4">
      <SearchBar query={query} setQuery={setQuery} />
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedExercise(item)}
              className="bg-white p-4 mb-2 rounded-2xl shadow"
            >
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-500">
                {item.primaryMuscles.join(", ")}
              </Text>
            </TouchableOpacity>
          )}
        />
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  workoutList: {
    padding: 20,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 