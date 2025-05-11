package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// FoodIntakeRequest represents the request for creating a food intake record
type FoodIntakeRequest struct {
	FoodName    string    `json:"foodName" binding:"required"`
	Calories    float64   `json:"calories"`
	Protein     float64   `json:"protein"`
	Carbs       float64   `json:"carbs"`
	Fat         float64   `json:"fat"`
	Date        time.Time `json:"date" binding:"required"`
	MealType    string    `json:"mealType" binding:"required"`
	ImageBase64 string    `json:"imageBase64"`
}

// FoodIntake represents a food intake record in the database
type FoodIntake struct {
	ID          string        `bson:"_id,omitempty" json:"_id,omitempty"`
	UserID      bson.ObjectID `bson:"users" json:"users"`
	FoodName    string        `bson:"foodName" json:"foodName"`
	Nutrients   []Nutrient    `bson:"nutrients" json:"nutrients"`
	Date        time.Time     `bson:"date" json:"date"`
	Ingredients []string      `bson:"ingredients" json:"ingredients"`
	MealType    string        `bson:"mealType" json:"mealType"`
	ImageUrl    string        `bson:"imageUrl" json:"imageUrl,omitempty"`
	ImagePath   string        `bson:"imagePath" json:"imagePath,omitempty"`
	Status      bool          `bson:"status" json:"status"`
	CreatedAt   time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time     `bson:"updatedAt" json:"updatedAt"`
}
type Nutrient struct {
	Name   string  `json:"name"`
	Amount float64 `json:"amount"`
	Unit   string  `json:"unit"`
}
