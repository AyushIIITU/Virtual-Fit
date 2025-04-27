package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Email          string            `bson:"email" json:"email"`
	Password       string            `bson:"password" json:"-"`
	FirstName      string            `bson:"first_name" json:"first_name"`
	LastName       string            `bson:"last_name" json:"last_name"`
	DateOfBirth    time.Time         `bson:"date_of_birth" json:"date_of_birth"`
	Gender         string            `bson:"gender" json:"gender"`
	Height         float64           `bson:"height" json:"height"` // in cm
	Weight         float64           `bson:"weight" json:"weight"` // in kg
	FitnessGoal    string            `bson:"fitness_goal" json:"fitness_goal"`
	ActivityLevel  string            `bson:"activity_level" json:"activity_level"`
	CreatedAt      time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time         `bson:"updated_at" json:"updated_at"`
	ProfilePicture string            `bson:"profile_picture" json:"profile_picture"`
}

type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type UserRegister struct {
	Email          string  `json:"email" binding:"required,email"`
	Password       string  `json:"password" binding:"required,min=6"`
	FirstName      string  `json:"first_name" binding:"required"`
	LastName       string  `json:"last_name" binding:"required"`
	DateOfBirth    string  `json:"date_of_birth" binding:"required"`
	Gender         string  `json:"gender" binding:"required"`
	Height         float64 `json:"height" binding:"required"`
	Weight         float64 `json:"weight" binding:"required"`
	FitnessGoal    string  `json:"fitness_goal" binding:"required"`
	ActivityLevel  string  `json:"activity_level" binding:"required"`
	ProfilePicture string  `json:"profile_picture"`
} 