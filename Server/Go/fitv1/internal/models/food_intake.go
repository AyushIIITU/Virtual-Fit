package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	// "go.mongodb.org/mongo-driver/bson/primitive"
)

type FoodIntake struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	FoodPath    string            `bson:"food_path" json:"food_path"`
	FoodName    string            `bson:"food_name" json:"food_name"`
	Nutrients   []string          `bson:"nutrients" json:"nutrients"`
	Ingredients []string          `bson:"ingredients" json:"ingredients"`
	CreatedAt   time.Time         `bson:"created_at" json:"created_at"`
} 