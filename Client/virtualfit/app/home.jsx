// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [workouts, setWorkouts] = useState([
    { id: 1, name: 'Full Body Workout', duration: '45 min', level: 'Beginner' },
    { id: 2, name: 'HIIT Cardio', duration: '30 min', level: 'Intermediate' },
    { id: 3, name: 'Strength Training', duration: '60 min', level: 'Advanced' },
    { id: 4, name: 'Yoga Flow', duration: '40 min', level: 'All Levels' },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        if (name) {
          setUserName(name);
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
      await AsyncStorage.removeItem('userName');
      
      // Force reload app to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
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
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Workouts this week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>160</Text>
          <Text style={styles.statLabel}>Minutes active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>620</Text>
          <Text style={styles.statLabel}>Calories burned</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Workouts</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.workoutsScrollView}
      >
        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() => navigation.navigate('Workout', { workout })}
          >
            <Image
              source={{ uri: `https://via.placeholder.com/200x150?text=${workout.name}` }}
              style={styles.workoutImage}
            />
            <View style={styles.workoutDetails}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutDuration}>{workout.duration}</Text>
                <Text style={styles.workoutLevel}>{workout.level}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Plan</Text>
      </View>

      <View style={styles.todayPlan}>
        <View style={styles.planItem}>
          <View style={styles.planTime}>
            <Text style={styles.planTimeText}>7:00 AM</Text>
          </View>
          <View style={styles.planActivity}>
            <Text style={styles.planActivityTitle}>Morning Stretch</Text>
            <Text style={styles.planActivityDesc}>10 min · Flexibility</Text>
          </View>
        </View>

        <View style={styles.planItem}>
          <View style={styles.planTime}>
            <Text style={styles.planTimeText}>6:30 PM</Text>
          </View>
          <View style={styles.planActivity}>
            <Text style={styles.planActivityTitle}>Full Body Workout</Text>
            <Text style={styles.planActivityDesc}>45 min · Strength</Text>
          </View>
        </View>
      </View>

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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#4A90E2',
  },
  workoutsScrollView: {
    paddingLeft: 20,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 200,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  workoutImage: {
    width: '100%',
    height: 120,
  },
  workoutDetails: {
    padding: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  workoutDuration: {
    fontSize: 12,
    color: '#666',
  },
  workoutLevel: {
    fontSize: 12,
    color: '#4A90E2',
  },
  todayPlan: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  planTime: {
    width: 80,
  },
  planTimeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  planActivity: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 15,
  },
  planActivityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  planActivityDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#666',
    fontSize: 16,
  }
});
