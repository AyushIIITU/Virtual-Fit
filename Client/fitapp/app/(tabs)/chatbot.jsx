import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "192.168.90.168:8000"; // Update this

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const websocket = useRef(null);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    connectWebSocket();
    
    // Clean up WebSocket connection when component unmounts
    return () => {
      if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
        websocket.current.close();
      }
    };
  }, []);

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
      } else {
        setError('No user data found. Please complete your profile first.');
      }
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    setConnecting(true);
    
    // Create WebSocket connection
    const ws = new WebSocket(`ws://${API_URL}/chat`);
    
    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setConnecting(false);
      
      // Add welcome message
      setMessages([{
        id: Date.now().toString(),
        text: "Welcome to VirtualFit! How can I help you today?",
        sender: "bot",
      }]);
    };
    
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Received:", data);
      
      if (data.type === "connection_established") {
        setSessionId(data.session_id);
      } 
      else if (data.type === "thinking") {
        // Show a thinking indicator
        setMessages((prev) => [
          {
            id: Date.now().toString(),
            text: "...",
            sender: "bot",
            isThinking: true,
          },
          ...prev,
        ]);
      }
      else if (data.type === "stream") {
        // Update the latest bot message with the new chunks
        setMessages((prev) => {
          const updated = [...prev];
          // Find the first bot message (should be at index 0 since list is inverted)
          const botMsgIndex = updated.findIndex(msg => msg.sender === "bot");
          if (botMsgIndex >= 0) {
            // If it's a thinking message, replace it
            if (updated[botMsgIndex].isThinking) {
              updated[botMsgIndex] = {
                ...updated[botMsgIndex],
                text: data.chunk,
                isThinking: false
              };
            } else {
              // Otherwise append to it
              updated[botMsgIndex] = {
                ...updated[botMsgIndex],
                text: updated[botMsgIndex].text + data.chunk
              };
            }
          }
          return updated;
        });
      }
      else if (data.type === "text_response") {
        // Handle the complete response - this overwrites any streaming messages
        // but ensures we have the complete response
        setMessages((prev) => {
          const updated = [...prev];
          // Check if we already have a bot message at the top
          if (updated.length > 0 && updated[0].sender === "bot") {
            // Replace the existing message with the complete response
            updated[0] = {
              ...updated[0],
              text: data.text,
              isThinking: false,
              id: Date.now().toString() // Update ID to ensure re-render
            };
            return updated;
          } else {
            // Add new message with the complete response
            return [
              {
                id: Date.now().toString(),
                text: data.text,
                sender: "bot",
              },
              ...prev,
            ];
          }
        });
      }
      else if (data.type === "error" || data.type === "info") {
        setMessages((prev) => [
          {
            id: Date.now().toString(),
            text: data.message,
            sender: "bot",
            isError: data.type === "error",
          },
          ...prev,
        ]);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnecting(false);
      Alert.alert("Connection Error", "Failed to connect to the chat server");
    };
    
    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnecting(false);
    };
    
    websocket.current = ws;
  };

  const sendTextMessage = () => {
    if (input.trim() === "") return;
    
    if (!userData) {
      Alert.alert(
        "Profile Required",
        "Please complete your profile before using the chat.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('auth')
          }
        ]
      );
      return;
    }
    
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    
    setMessages((prev) => [newMsg, ...prev]);
    
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify({
        message_type: "text",
        text: input,
        user_id: userData.id,
        user_data: {
          name: userData.name,
          Age: Math.floor((Date.now() - userData.dob) / (1000 * 60 * 60 * 24 * 365.25)),
          gender: userData.gender,
          height: userData.height,
          weight: userData.weight,
          goals: userData.goals,
          dietary_restrictions: userData.dietary_restrictions,
          daily_calorie_intake: userData.daily_calorie_intake,
          daily_protein_intake: userData.daily_protein_intake,
          foods_to_avoid: userData.foods_to_avoid,
          current_fitness_level: userData.current_fitness_level,
          health_considerations: userData.health_considerations,
          medical_conditions: userData.medical_conditions,
          food_allergies: userData.food_allergies,
          interested_activities: userData.interested_activities,
          days_per_week: userData.days_per_week,
          preferred_meal_frequency: userData.preferred_meal_frequency
        }
      }));
    } else {
      setMessages((prev) => [
        {
          id: Date.now().toString(),
          text: "Connection lost. Please try again later.",
          sender: "bot",
          isError: true,
        },
        ...prev,
      ]);
    }
    
    setInput("");
  };

  const sendImage = async () => {
    if (!image) return;
    
    if (!userData) {
      Alert.alert(
        "Profile Required",
        "Please complete your profile before using the chat.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('auth')
          }
        ]
      );
      return;
    }
    
    const newMsg = {
      id: Date.now().toString(),
      text: "Analyzing food image...",
      image: image,
      sender: "user",
    };
    
    setMessages((prev) => [newMsg, ...prev]);
    
    // Create form data for image upload
    const formData = new FormData();
    formData.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: 'food.jpg',
    });
    
    try {
      // Use the REST API for image analysis
      const response = await fetch(`http://${API_URL}/analyze-food`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = await response.json();
      
      if (result.status === "success") {
        setMessages((prev) => [
          {
            id: Date.now().toString(),
            text: `Food: ${result.food_name}\n\nNutrition: ${JSON.stringify(result.nutrition, null, 2)}`,
            sender: "bot",
            isAnalysis: true,
          },
          ...prev,
        ]);
      } else {
        throw new Error(result.detail || "Failed to analyze image");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setMessages((prev) => [
        {
          id: Date.now().toString(),
          text: `Error analyzing image: ${error.message}`,
          sender: "bot",
          isError: true,
        },
        ...prev,
      ]);
    }
    
    setImage(null);
  };

  const pickImage = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to upload images");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const renderItem = ({ item }) => (
    <View
      className={`mb-2 p-3 rounded-2xl max-w-[80%] ${
        item.sender === "user" 
          ? "bg-blue-500 self-end" 
          : item.isError 
            ? "bg-red-100 self-start" 
            : item.isAnalysis 
              ? "bg-green-100 self-start" 
              : item.isThinking
                ? "bg-yellow-100 self-start"
                : "bg-gray-300 self-start"
      }`}
    >
      {item.image && (
        <Image source={{ uri: item.image }} className="w-40 h-40 rounded-xl mb-1" />
      )}
      <Text className={item.sender === "user" ? "text-white" : item.isError ? "text-red-700" : "text-black"}>
        {item.text}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading user data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded"
          onPress={() => navigation.navigate('auth')}
        >
          <Text className="text-white">Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      {connecting && (
        <View className="bg-yellow-100 p-2 rounded mb-2">
          <Text className="text-yellow-800">Connecting to chat server...</Text>
        </View>
      )}
      
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}
      />

      {image && (
        <View className="items-center mb-2">
          <Image source={{ uri: image }} className="w-24 h-24 rounded-xl" />
          <TouchableOpacity 
            onPress={() => setImage(null)}
            className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
          >
            <Text className="text-white font-bold">×</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row items-center gap-2">
        {/* <TouchableOpacity onPress={pickImage} className="bg-gray-200 p-3 rounded-xl">
          <Text>📷</Text>
        </TouchableOpacity> */}

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 p-3 rounded-xl"
        />

        {image ? (
          <TouchableOpacity onPress={sendImage} className="bg-green-500 p-3 rounded-xl">
            <Text className="text-white">Analyze</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={sendTextMessage} 
            disabled={input.trim() === ""}
            className={`p-3 rounded-xl ${input.trim() === "" ? "bg-gray-300" : "bg-blue-500"}`}
          >
            <Text className="text-white">Send</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Chatbot;