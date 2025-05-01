package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	// "go.mongodb.org/mongo-driver/bson/primitive"
)

type FoodIntake struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      bson.ObjectID `bson:"user_id" json:"user_id"`
	ImagePath   string        `bson:"image_path" json:"image_path"`
	FoodName    string        `bson:"food_name" json:"food_name"`
	Nutrients   []Nutrient    `bson:"nutrients" json:"nutrients"`
	Ingredients []string      `bson:"ingredients" json:"ingredients"`
	Status      bool          `bson:"status" json:"status" default:"false"`
	CreatedAt   time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time     `bson:"updated_at" json:"updated_at"`
}

type Nutrient struct {
	Name   string  `bson:"name" json:"name"`
	Amount float64 `bson:"amount" json:"amount"`
	Unit   string  `bson:"unit" json:"unit"`
} 