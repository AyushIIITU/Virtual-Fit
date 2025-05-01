import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Avatar, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/Utils/api';

interface UserData {
  name: string;
  email: string;
  height: number;
  weight: number;
  gender: string;
  region: string;
  daily_calorie_intake: number;
  daily_protein_intake: number;
  current_fitness_level: string;
  days_per_week: number;
  [key: string]: any; // For other potential fields
}

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log(parsedData)
        setUserData(parsedData);
        setEditedData(parsedData);
      }
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API}/v1/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>No user data found</Text>
        <Button onPress={() => router.replace('/(auth)/login')}>
          Go to Login
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={userData.name.split(' ').map(n => n[0]).join('')}
        />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {isEditing ? (
          <>
            <TextInput
              label="Name"
              value={editedData.name}
              onChangeText={(text) => setEditedData({ ...editedData, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={editedData.email}
              onChangeText={(text) => setEditedData({ ...editedData, email: text })}
              style={styles.input}
              keyboardType="email-address"
            />
            <TextInput
              label="Height (cm)"
              value={editedData.height?.toString()}
              onChangeText={(text) => setEditedData({ ...editedData, height: parseFloat(text) })}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Weight (kg)"
              value={editedData.weight?.toString()}
              onChangeText={(text) => setEditedData({ ...editedData, weight: parseFloat(text) })}
              style={styles.input}
              keyboardType="numeric"
            />
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Height:</Text>
              <Text style={styles.value}>{userData.height} cm</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Weight:</Text>
              <Text style={styles.value}>{userData.weight} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{userData.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Region:</Text>
              <Text style={styles.value}>{userData.region}</Text>
            </View>
          </>
        )}
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitness Goals</Text>
        {isEditing ? (
          <>
            <TextInput
              label="Daily Calorie Intake"
              value={editedData.daily_calorie_intake?.toString()}
              onChangeText={(text) => setEditedData({ ...editedData, daily_calorie_intake: parseInt(text) })}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Daily Protein Intake (g)"
              value={editedData.daily_protein_intake?.toString()}
              onChangeText={(text) => setEditedData({ ...editedData, daily_protein_intake: parseInt(text) })}
              style={styles.input}
              keyboardType="numeric"
            />
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Daily Calories:</Text>
              <Text style={styles.value}>{userData.daily_calorie_intake} kcal</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Daily Protein:</Text>
              <Text style={styles.value}>{userData.daily_protein_intake} g</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fitness Level:</Text>
              <Text style={styles.value}>{userData.current_fitness_level}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Workout Days:</Text>
              <Text style={styles.value}>{userData.days_per_week} days/week</Text>
            </View>
          </>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
            >
              Save Changes
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setEditedData(userData);
                setIsEditing(false);
              }}
              style={styles.button}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            mode="contained"
            onPress={() => setIsEditing(true)}
            style={styles.button}
          >
            Edit Profile
          </Button>
        )}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.button, styles.logoutButton]}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  divider: {
    marginVertical: 10,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    marginBottom: 10,
  },
  logoutButton: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
}); 