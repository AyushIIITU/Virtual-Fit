import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Card, Button, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { API } from '@/Utils/api';

const WorkoutList = () => {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const fetchWorkouts = async (offset = 0, name = '') => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API}/v1/workout?limit=${pagination.limit}&offset=${offset}&name=${name}`
      );
      const data = await response.json();
      setWorkouts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleSearch = () => {
    fetchWorkouts(0, searchQuery);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      fetchWorkouts(pagination.offset + pagination.limit, searchQuery);
    }
  };

  const renderWorkoutCard = ({ item }) => (
    <Card style={styles.card} onPress={() => router.push(`/workout/${item.ID}`)}>
      <Card.Cover source={{ uri: item.Images[0] }} style={styles.cardImage} />
      <Card.Content>
        <Text style={styles.title}>{item.Name}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.detail}>Level: {item.Level}</Text>
          <Text style={styles.detail}>Equipment: {item.Equipment}</Text>
        </View>
        <View style={styles.musclesContainer}>
          <Text style={styles.muscleLabel}>Primary Muscles:</Text>
          <Text style={styles.muscleText}>{item.PrimaryMuscles.join(', ')}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && workouts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search workouts"
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />
      <FlatList
        data={workouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.ID}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading ? (
            <ActivityIndicator style={styles.loadingMore} />
          ) : null
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardImage: {
    height: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  musclesContainer: {
    marginTop: 8,
  },
  muscleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  muscleText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    marginVertical: 16,
  },
});

export default WorkoutList; 