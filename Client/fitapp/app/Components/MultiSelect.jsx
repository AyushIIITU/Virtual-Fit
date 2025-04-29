import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';

const MultiSelect = ({ label, options, selectedValues, onValueChange }) => {
  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((v) => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.chipContainer}>
          {options.map((option) => (
            <Chip
              key={option}
              selected={selectedValues.includes(option)}
              onPress={() => toggleValue(option)}
              style={styles.chip}
              mode={selectedValues.includes(option) ? 'flat' : 'outlined'}
            >
              {option}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  scrollView: {
    flexGrow: 0,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
});

export default MultiSelect; 