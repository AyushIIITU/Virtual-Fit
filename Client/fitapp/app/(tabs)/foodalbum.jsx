import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

export default function FoodAlbum() {
  const [foodIntakes, setFoodIntakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFoodIntakes();
  }, []);

  const fetchFoodIntakes = async () => {
    try {
      const response = await axios.get('/api/v1/food-intake');
      setFoodIntakes(response.data);
    } catch (error) {
      console.error('Error fetching food intakes:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchFoodIntakes().finally(() => setRefreshing(false));
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload food images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'food_image.jpg',
      });

      await axios.post('/api/v1/food-intake', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh the food intakes list after upload
      fetchFoodIntakes();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {foodIntakes.map((item, index) => (
            <View key={index} style={styles.foodItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.foodImage}
              />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.foodName || 'Processing...'}</Text>
                {item.status === false ? (
                  <Text style={styles.processingText}>Processing...</Text>
                ) : (
                  <>
                    <Text style={styles.nutritionText}>
                      Nutrition: {item.nutrition || 'Not available'}
                    </Text>
                    <Text style={styles.ingredientsText}>
                      Ingredients: {item.ingredients || 'Not available'}
                    </Text>
                  </>
                )}
              </View>
            </View>
          ))}
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
  nutritionText: {
    marginTop: 4,
    color: '#444',
  },
  ingredientsText: {
    marginTop: 4,
    color: '#444',
  },
}); 