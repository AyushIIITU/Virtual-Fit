import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Chip, Button, IconButton, ProgressBar } from 'react-native-paper';
import { API } from '@/Utils/api';

const ExerciseDetails = ({ exercise }) => {
  const [timerType, setTimerType] = useState(null); // 'rep' or 'countdown' or null
  const [timerActive, setTimerActive] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [repDuration, setRepDuration] = useState(10); // Default 10 seconds per rep
  const [countdownDuration, setCountdownDuration] = useState(600); // Default 10 minutes (600 seconds)
  const [remainingTime, setRemainingTime] = useState(countdownDuration);
  
  const timerRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to timer section when timer type is selected
    if (timerType && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [timerType]);

  const startTimer = () => {
    if (timerActive) return;
    
    setTimerActive(true);
    
    if (timerType === 'rep') {
      setTimerValue(0);
      setRepCount(0);
      
      timerRef.current = setInterval(() => {
        setTimerValue(prev => {
          const newValue = prev + 1;
          if (newValue >= repDuration) {
            setRepCount(prevCount => prevCount + 1);
            return 0; // Reset timer for next rep
          }
          return newValue;
        });
      }, 1000);
    } else if (timerType === 'countdown') {
      setRemainingTime(countdownDuration);
      
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            stopTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const stopTimer = () => {
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    if (timerType === 'rep') {
      setTimerValue(0);
      setRepCount(0);
    } else if (timerType === 'countdown') {
      setRemainingTime(countdownDuration);
    }
  };

  const selectTimerType = (type) => {
    stopTimer();
    setTimerType(type);
    if (type === 'rep') {
      setTimerValue(0);
      setRepCount(0);
    } else if (type === 'countdown') {
      setRemainingTime(countdownDuration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustRepDuration = (change) => {
    const newDuration = Math.max(1, repDuration + change);
    setRepDuration(newDuration);
  };

  const adjustCountdownDuration = (change) => {
    const newDuration = Math.max(60, countdownDuration + change);
    setCountdownDuration(newDuration);
    if (!timerActive) {
      setRemainingTime(newDuration);
    }
  };

  if (!exercise) {
    return <Text style={styles.noData}>No exercise selected</Text>;
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} ref={scrollViewRef}>
        <Text style={styles.title}>{exercise.name}</Text>
        
        {/* Timer Section */}
        <Card style={styles.timerCard}>
                    <View style={styles.timerContent}>
            {!timerType ? (
              // Timer Type Selection
              <View style={styles.timerTypeSelection}>
                <Text style={styles.sectionTitle}>Timer</Text>
                <Text style={styles.timerInstructions}>Select a timer to help track your exercise:</Text>
                
                <View style={styles.timerTypeButtons}>
                  <TouchableOpacity 
                    style={styles.timerTypeButton} 
                    onPress={() => selectTimerType('rep')}
                  >
                    <Text style={styles.timerTypeButtonText}>Rep Timer</Text>
                    <Text style={styles.timerTypeDescription}>
                      Count reps based on a fixed time per repetition
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.timerTypeButton} 
                    onPress={() => selectTimerType('countdown')}
                  >
                    <Text style={styles.timerTypeButtonText}>Countdown Timer</Text>
                    <Text style={styles.timerTypeDescription}>
                      Set a total workout time for this exercise
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : timerType === 'rep' ? (
              // Rep Timer
              <View>
                <View style={styles.timerHeader}>
                  <Text style={styles.sectionTitle}>Rep Timer</Text>
                  <IconButton 
                    icon="close" 
                    size={20} 
                    onPress={() => selectTimerType(null)}
                  />
                </View>
                
                <Text style={styles.timerValue}>{formatTime(timerValue)}</Text>
                <Text style={styles.repCountText}>Reps: {repCount}</Text>
                
                <ProgressBar 
                  progress={timerValue / repDuration} 
                  color="#2196F3" 
                  style={styles.progressBar} 
                />
                
                <View style={styles.timerSettings}>
                  <Text style={styles.timerSettingLabel}>Seconds per Rep:</Text>
                  <View style={styles.timerSettingControls}>
                    <TouchableOpacity 
                      style={styles.adjustButton} 
                      onPress={() => adjustRepDuration(-1)}
                      disabled={timerActive}
                    >
                      <Text style={[styles.adjustButtonText, timerActive && styles.disabledText]}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.timerSettingValue}>{repDuration}</Text>
                    <TouchableOpacity 
                      style={styles.adjustButton} 
                      onPress={() => adjustRepDuration(1)}
                      disabled={timerActive}
                    >
                      <Text style={[styles.adjustButtonText, timerActive && styles.disabledText]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.timerControls}>
                  <Button 
                    mode="contained" 
                    onPress={timerActive ? stopTimer : startTimer}
                    style={[styles.timerControlButton, timerActive ? styles.stopButton : styles.startButton]}
                  >
                    {timerActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={resetTimer}
                    style={styles.timerControlButton}
                  >
                    Reset
                  </Button>
                </View>
              </View>
            ) : (
              // Countdown Timer
              <View>
                <View style={styles.timerHeader}>
                  <Text style={styles.sectionTitle}>Countdown Timer</Text>
                  <IconButton 
                    icon="close" 
                    size={20} 
                    onPress={() => selectTimerType(null)}
                  />
                </View>
                
                <Text style={styles.timerValue}>{formatTime(remainingTime)}</Text>
                
                <ProgressBar 
                  progress={remainingTime / countdownDuration} 
                  color="#4CAF50" 
                  style={styles.progressBar} 
                />
                
                <View style={styles.timerSettings}>
                  <Text style={styles.timerSettingLabel}>Total Duration (minutes):</Text>
                  <View style={styles.timerSettingControls}>
                    <TouchableOpacity 
                      style={styles.adjustButton} 
                      onPress={() => adjustCountdownDuration(-60)}
                      disabled={timerActive}
                    >
                      <Text style={[styles.adjustButtonText, timerActive && styles.disabledText]}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.timerSettingValue}>{Math.floor(countdownDuration / 60)}</Text>
                    <TouchableOpacity 
                      style={styles.adjustButton} 
                      onPress={() => adjustCountdownDuration(60)}
                      disabled={timerActive}
                    >
                      <Text style={[styles.adjustButtonText, timerActive && styles.disabledText]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.timerControls}>
                  <Button 
                    mode="contained" 
                    onPress={timerActive ? stopTimer : startTimer}
                    style={[styles.timerControlButton, timerActive ? styles.stopButton : styles.startButton]}
                  >
                    {timerActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={resetTimer}
                    style={styles.timerControlButton}
                  >
                    Reset
                  </Button>
                </View>
              </View>
            )}
          </View>
        </Card>
        
        {/* Exercise Images */}
        {exercise.images && exercise.images.length > 0 && (
          <Card style={styles.imageCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Exercise Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {exercise.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: `${API}/v1/workout/${image}` }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}
        
        {/* Exercise Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Exercise Details</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Chip style={styles.categoryChip}>{exercise.category || 'Not specified'}</Chip>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Level:</Text>
              <Text style={styles.infoValue}>{exercise.level || 'Not specified'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Equipment:</Text>
              <Text style={styles.infoValue}>{exercise.equipment || 'None'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Force:</Text>
              <Text style={styles.infoValue}>{exercise.force || 'Not specified'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mechanic:</Text>
              <Text style={styles.infoValue}>{exercise.mechanic || 'Not specified'}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Muscles */}
        <Card style={styles.muscleCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Primary Muscles</Text>
            <View style={styles.muscleChips}>
              {exercise.primaryMuscles && exercise.primaryMuscles.map((muscle, index) => (
                <Chip key={index} style={styles.muscleChip}>{muscle}</Chip>
              ))}
              {(!exercise.primaryMuscles || exercise.primaryMuscles.length === 0) && (
                <Text style={styles.noDataText}>No primary muscles specified</Text>
              )}
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.muscleCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Secondary Muscles</Text>
            <View style={styles.muscleChips}>
              {exercise.secondaryMuscles && exercise.secondaryMuscles.map((muscle, index) => (
                <Chip key={index} style={styles.secondaryMuscleChip}>{muscle}</Chip>
              ))}
              {(!exercise.secondaryMuscles || exercise.secondaryMuscles.length === 0) && (
                <Text style={styles.noDataText}>No secondary muscles specified</Text>
              )}
            </View>
          </Card.Content>
        </Card>
        
        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {exercise.instructions && exercise.instructions.map((step, index) => (
              <View key={index} style={styles.instructionStep}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            {(!exercise.instructions || exercise.instructions.length === 0) && (
              <Text style={styles.noDataText}>No instructions available</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  noData: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  // Cards
  timerCard: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  imageCard: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  muscleCard: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  instructionsCard: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  // Timer
  timerTypeSelection: {
    padding: 16,
  },
  timerInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  timerTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerTypeButton: {
    backgroundColor: '#f5f5f5',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    alignItems: 'center',
  },
  timerTypeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timerTypeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  timerContent: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  timerHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  repCountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    marginBottom: 16,
  },
  timerSettings: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 16,
  },
  timerSettingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timerSettingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSettingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
    textAlign: 'center',
  },
  adjustButton: {
    width: 32,
    height: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  adjustButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  timerControlButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  // Images
  imageScroll: {
    height: 200,
    marginTop: 8,
  },
  image: {
    width: 250,
    height: 200,
    marginRight: 10,
    borderRadius: 8,
  },
  // Exercise Info
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    textTransform: 'capitalize',
  },
  categoryChip: {
    backgroundColor: '#e0f7fa',
  },
  // Muscles
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleChip: {
    margin: 4,
    backgroundColor: '#e0f7fa',
  },
  secondaryMuscleChip: {
    margin: 4,
    backgroundColor: '#fff9c4',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  // Instructions
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    width: 20,
  },
  stepText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  }
});

export default ExerciseDetails;