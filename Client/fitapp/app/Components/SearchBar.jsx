// SearchBar.jsx
import React from "react";
import { View, TextInput } from "react-native";

const SearchBar = ({ query, setQuery }) => {
  return (
    <View className="p-2">
      <TextInput
        className="bg-white rounded-2xl shadow p-2"
        placeholder="Search exercises..."
        value={query}
        onChangeText={setQuery}
      />
    </View>
  );
};

export default SearchBar;