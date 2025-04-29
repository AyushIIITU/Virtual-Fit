package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

// Exercise represents an exercise with details and instructions
type Workout struct {
	ID               bson.ObjectID `json:"_id" bson:"_id"`
	Name             string        `json:"name" bson:"name"`
	Force            string        `json:"force" bson:"force"`
	Level            string        `json:"level" bson:"level"`
	Mechanic         string        `json:"mechanic" bson:"mechanic"`
	Equipment        string        `json:"equipment" bson:"equipment"`
	PrimaryMuscles   []string      `json:"primaryMuscles" bson:"primaryMuscles"`
	SecondaryMuscles []string      `json:"secondaryMuscles" bson:"secondaryMuscles"`
	Instructions     []string      `json:"instructions" bson:"instructions"`
	Category         string        `json:"category" bson:"category"`
	Images           []string      `json:"images" bson:"images"`
	ID_Default       string        `json:"id" bson:"id"`
}

// Create a response structure that converts ObjectID to string
type WorkoutResponse struct {
	ID               string   `json:"id"`
	Name             string   `json:"name"`
	Force            string   `json:"force"`
	Level            string   `json:"level"`
	Mechanic         string   `json:"mechanic"`
	Equipment        string   `json:"equipment"`
	PrimaryMuscles   []string `json:"primaryMuscles"`
	SecondaryMuscles []string `json:"secondaryMuscles"`
	Instructions     []string `json:"instructions"`
	Category         string   `json:"category"`
	Images           []string `json:"images"`
}

// WorkoutSearchCriteria defines the parameters for searching workouts
type WorkoutSearchCriteria struct {
	Name       string
	Category   string
	Level      string
	Equipment  string
	Force      string
	Mechanic   string
	Muscle     string
	Limit      int
	Offset     int
}
