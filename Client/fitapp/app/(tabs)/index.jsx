import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import SearchBar from "@/app/Components/SearchBar";
import ExerciseDetails from "@/app/Components/ExerciseDetails";
import { Card, Chip } from 'react-native-paper';
import { API } from '@/Utils/api';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [query, setQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

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

  const fetchExercises = async (offset = 0, name = '') => {
    try {
      setLoading(true);
      let url = `${API}/v1/workout?limit=${pagination.limit}&offset=${offset}`;
      if (name) {
        url = `${API}/v1/workout/search?name=${name}`;
      }
      const response = await fetch(url);
      const { data, pagination: apiPagination } = await response.json();
  
      if (offset === 0) {
        setExercises(data);
      } else {
        setExercises([...exercises, ...data]);
      }
  
      setPagination({
        ...pagination,
        offset,
        total: apiPagination.total,
        hasMore: apiPagination.hasMore,
      });
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (query) {
      const debounceTimer = setTimeout(() => {
        setPagination(prev => ({ ...prev, offset: 0 }));
        fetchExercises(0, query);
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      fetchExercises(0, '');
    }
  }, [query]);

  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchExercises(pagination.offset + pagination.limit, query);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExercises(0, query);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      router.replace('/login');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const renderExerciseCard = ({ item }) => (
    <Card style={styles.card} onPress={() => setSelectedExercise(item)}>
      <Card.Cover 
        source={{ 
          uri: item.images && item.images.length > 0 
            ? `${API}/v1/workout/${item.images[0]}` 
            : 'https://via.placeholder.com/300x200?text=No+Image'
        }}
        style={styles.cardImage} 
      />
      <Card.Content>
        <Text style={styles.title}>{item.name || 'Unnamed Exercise'}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.detail}>Level: {item.level || 'Not specified'}</Text>
          <Text style={styles.detail}>Equipment: {item.equipment || 'None'}</Text>
        </View>
        <View style={styles.musclesContainer}>
          <Text style={styles.muscleLabel}>Primary Muscles:</Text>
          <Text style={styles.muscleText}>
            {item.primaryMuscles && item.primaryMuscles.length > 0 
              ? item.primaryMuscles.join(', ') 
              : 'Not specified'}
          </Text>
        </View>
        <View style={styles.chipContainer}>
          <Chip style={styles.categoryChip}>{item.category || 'Unknown'}</Chip>
          {item.force && <Chip style={styles.forceChip}>{item.force}</Chip>}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
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
        <View style={styles.detailContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedExercise(null)}
          >
            <Text style={styles.backButtonText}>{'<-- Back to list'}</Text>
          </TouchableOpacity>
          <ExerciseDetails exercise={selectedExercise} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <SearchBar query={query} setQuery={setQuery} />
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            renderItem={renderExerciseCard}
            contentContainerStyle={styles.flatListContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={() => (
              loading ? <ActivityIndicator style={styles.loadingMore} /> : null
            )}
            ListEmptyComponent={() => (
              loading ? (
                <ActivityIndicator style={styles.loading} />
              ) : (
                <Text style={styles.emptyText}>No exercises found</Text>
              )
            )}
          />
        </View>
      )}

      <TouchableOpacity
  style={styles.logoutButton}
  onPress={handleLogout}
  accessible={true}
  accessibilityLabel="Logout"
>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
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
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  backButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  flatListContent: {
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
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0f7fa',
  },
  forceChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff9c4',
  },
  loading: {
    marginVertical: 20,
  },
  loadingMore: {
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#666',
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