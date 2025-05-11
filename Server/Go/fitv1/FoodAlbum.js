import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { API } from '@/Utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FoodAlbum() {
  const [foodIntakes, setFoodIntakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");

  // Load token only once when component mounts
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading token:", error);
        Alert.alert('Error', 'Failed to load authentication token');
      }
    };
    
    loadToken();
  }, []);

  // Fetch food intakes whenever token changes
  useEffect(() => {
    if (token) {
      fetchFoodIntakes();
    }
  }, [token]);
  
  const fetchFoodIntakes = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API}/v1/food-intake`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFoodIntakes(response.data || []);
    } catch (error) {
      console.error('Error fetching food intakes:', error);
      Alert.alert('Error', 'Failed to fetch food intake history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchFoodIntakes().finally(() => setRefreshing(false));
  }, [token]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload food images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset) => {
    if (!token) {
      Alert.alert('Authentication Error', 'Please log in again');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Create a proper file object for upload
      const fileExtension = imageAsset.uri.split('.').pop();
      const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      
      formData.append('image', {
        uri: imageAsset.uri,
        name: `food_${Date.now()}.${fileExtension}`,
        type: mimeType,
      });
      
      const response = await axios.post(`${API}/v1/food-intake`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.food_id) {
        // Start polling for status
        pollFoodIntakeStatus(response.data.food_id);
      }
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error.message);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || 'Failed to upload image'
      );
    } finally {
      setLoading(false);
    }
  };

  const pollFoodIntakeStatus = async (foodId) => {
    try {
      const response = await axios.get(`${API}/v1/food-intake/${foodId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === true) {
        // Processing complete, refresh the list
        await fetchFoodIntakes();
        Alert.alert('Success', 'Food analysis complete!');
      } else {
        // Still processing, poll again after delay
        setTimeout(() => pollFoodIntakeStatus(foodId), 2000);
      }
    } catch (error) {
      console.error('Error polling status:', error);
    }
  };

  const renderFoodItem = (item) => {
    const imageUrl = item.imageUrl ? `${API}/v1/food-images/${item.imageUrl.split('/').pop()}` : null;
    
    return (
      <View key={item._id} style={styles.foodItem}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.foodImage}
          />
        )}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.foodName || 'Processing...'}</Text>
          {!item.status ? (
            <Text style={styles.processingText}>Processing...</Text>
          ) : (
            <>
              {item.nutrients && item.nutrients.length > 0 && (
                <View style={styles.nutrientsContainer}>
                  {item.nutrients.map((nutrient, idx) => (
                    <Text key={idx} style={styles.nutritionText}>
                      {nutrient.name}: {nutrient.amount} {nutrient.unit}
                    </Text>
                  ))}
                </View>
              )}
              {item.ingredients && item.ingredients.length > 0 && (
                <Text style={styles.ingredientsText}>
                  Ingredients: {item.ingredients.join(', ')}
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickImage}
          disabled={loading}
        >
          <FontAwesome name="camera" size={24} color="white" />
          <Text style={styles.uploadButtonText}>Upload Food Image</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Processing your food image...</Text>
          </View>
        )}

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Food Intake History</Text>
          {foodIntakes.length === 0 ? (
            <Text style={styles.emptyText}>No food intake records yet</Text>
          ) : (
            foodIntakes.map(renderFoodItem)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  historyContainer: {
    padding: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  processingText: {
    color: '#666',
    fontStyle: 'italic',
  },
  nutrientsContainer: {
    marginTop: 4,
  },
  nutritionText: {
    color: '#444',
    fontSize: 14,
  },
  ingredientsText: {
    marginTop: 4,
    color: '#444',
    fontSize: 14,
  },
}); 