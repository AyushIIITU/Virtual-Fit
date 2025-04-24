// Chatbot.jsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);

  const sendMessage = () => {
    if (input.trim() === "" && !image) return;

    const newMsg = {
      id: Date.now().toString(),
      text: input,
      image: image,
      sender: "user",
    };

    setMessages((prev) => [newMsg, ...prev]);
    setInput("");
    setImage(null);

    // Mock reply
    setTimeout(() => {
      setMessages((prev) => [
        {
          id: Date.now().toString(),
          text: "Thanks for your message!",
          sender: "bot",
        },
        ...prev,
      ]);
    }, 800);
  };

  const pickImage = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const renderItem = ({ item }) => (
    <View
      className={`mb-2 p-3 rounded-2xl max-w-[80%] ${
        item.sender === "user" ? "bg-blue-500 self-end" : "bg-gray-300 self-start"
      }`}
    >
      {item.image && (
        <Image source={{ uri: item.image }} className="w-40 h-40 rounded-xl mb-1" />
      )}
      <Text className={item.sender === "user" ? "text-white" : "text-black"}>{item.text}</Text>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-white">
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      />

      {image && (
        <Image source={{ uri: image }} className="w-24 h-24 rounded-xl self-center mb-2" />
      )}

      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={pickImage} className="bg-gray-200 p-2 rounded-xl">
          <Text>📷</Text>
        </TouchableOpacity>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 p-2 rounded-xl"
        />

        <TouchableOpacity onPress={sendMessage} className="bg-blue-500 p-2 rounded-xl">
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Chatbot;
