package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Exercise struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string            `bson:"name" json:"name"`
	Description string            `bson:"description" json:"description"`
	MuscleGroup string            `bson:"muscle_group" json:"muscle_group"`
	Equipment   string            `bson:"equipment" json:"equipment"`
	Difficulty  string            `bson:"difficulty" json:"difficulty"`
	Instructions []string         `bson:"instructions" json:"instructions"`
	VideoURL     string           `bson:"video_url" json:"video_url"`
	CreatedAt    time.Time        `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time        `bson:"updated_at" json:"updated_at"`
}

type WorkoutExercise struct {
	ExerciseID bson.ObjectID `bson:"exercise_id" json:"exercise_id"`
	Sets       int               `bson:"sets" json:"sets"`
	Reps       int               `bson:"reps" json:"reps"`
	Weight     float64           `bson:"weight" json:"weight"`
	Duration   int               `bson:"duration" json:"duration"` // in seconds
	Notes      string            `bson:"notes" json:"notes"`
}

type Workout struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      bson.ObjectID `bson:"user_id" json:"user_id"`
	Name        string            `bson:"name" json:"name"`
	Description string            `bson:"description" json:"description"`
	Exercises   []WorkoutExercise `bson:"exercises" json:"exercises"`
	Duration    int               `bson:"duration" json:"duration"` // in minutes
	Difficulty  string            `bson:"difficulty" json:"difficulty"`
	Date        time.Time         `bson:"date" json:"date"`
	CreatedAt   time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time         `bson:"updated_at" json:"updated_at"`
}

type WorkoutProgress struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectID `bson:"user_id" json:"user_id"`
	WorkoutID bson.ObjectID `bson:"workout_id" json:"workout_id"`
	Date      time.Time         `bson:"date" json:"date"`
	Exercises []struct {
		ExerciseID bson.ObjectID `bson:"exercise_id" json:"exercise_id"`
		Sets       []struct {
			Reps   int     `bson:"reps" json:"reps"`
			Weight float64 `bson:"weight" json:"weight"`
		} `bson:"sets" json:"sets"`
		Notes string `bson:"notes" json:"notes"`
	} `bson:"exercises" json:"exercises"`
	TotalDuration int       `bson:"total_duration" json:"total_duration"`
	CreatedAt     time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time `bson:"updated_at" json:"updated_at"`
} 