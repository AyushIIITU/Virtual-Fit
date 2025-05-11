import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: true,
      tabBarActiveTintColor: '#4A90E2',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="auth"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Chat Bot",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="robot" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="foodalbum"
        options={{
          title: "Food Album",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="camera" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}