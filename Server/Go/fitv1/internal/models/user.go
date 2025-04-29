package models

import (
	"time"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID                     bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name                   string          `bson:"name" json:"name" validate:"required"`
	Email                  string          `bson:"email" json:"email" validate:"required,email"`
	PasswordHash           string          `bson:"password_hash" json:"password_hash,omitempty" validate:"required"`
	DOB                    time.Time       `bson:"dob" json:"dob" validate:"required"`
	Gender                 string          `bson:"gender" json:"gender" validate:"required,oneof=Male Female Other"`
	Height                 float64         `bson:"height" json:"height" validate:"required,gt=0"`
	Weight                 float64         `bson:"weight" json:"weight" validate:"required,gt=0"`
	Region                 string          `bson:"region" json:"region" validate:"required"`
	Goals                  []string        `bson:"goals" json:"goals" validate:"required,min=1,dive,required"`
	DietaryRestrictions    []string        `bson:"dietary_restrictions" json:"dietary_restrictions"`
	DailyCalorieIntake     int             `bson:"daily_calorie_intake" json:"daily_calorie_intake" validate:"required,min=1000,max=5000"`
	DailyProteinIntake     int             `bson:"daily_protein_intake" json:"daily_protein_intake" validate:"required,min=30,max=500"`
	FoodsToAvoid           []string        `bson:"foods_to_avoid" json:"foods_to_avoid"`
	Exercises              []bson.ObjectID `bson:"exercises" json:"exercises"`
	PreferredMealFrequency int             `bson:"preferred_meal_frequency" json:"preferred_meal_frequency" validate:"required,min=1,max=6"`
	CurrentFitnessLevel    string          `bson:"current_fitness_level" json:"current_fitness_level" validate:"required,oneof=Beginner Intermediate Advanced"`
	HealthConsiderations   []string        `bson:"health_considerations" json:"health_considerations"`
	InterestedActivities   []string        `bson:"interested_activities" json:"interested_activities"`
	DaysPerWeek            int             `bson:"days_per_week" json:"days_per_week" validate:"required,min=1,max=7"`
	MedicalConditions      []string        `bson:"medical_conditions" json:"medical_conditions"`
	FoodAllergies          []string        `bson:"food_allergies" json:"food_allergies"`
	FoodAlbum              []bson.ObjectID `bson:"food_album" json:"food_album"`
	CreatedAt              time.Time       `bson:"created_at" json:"created_at"`
	UpdatedAt              time.Time       `bson:"updated_at" json:"updated_at"`
}
type UserRegister struct {
	Name                   string          `bson:"name" json:"name" validate:"required"`
	Email                  string          `bson:"email" json:"email" validate:"required,email"`
	Password               string          `bson:"password" json:"password,omitempty" validate:"required,min=8"`
	DateOfBirth            time.Time       `bson:"dob" json:"dob" validate:"required"`
	Gender                 string          `bson:"gender" json:"gender" validate:"required,oneof=Male Female Other"`
	Height                 float64         `bson:"height" json:"height" validate:"required,gt=0"`
	Weight                 float64         `bson:"weight" json:"weight" validate:"required,gt=0"`
	Region                 string          `bson:"region" json:"region" validate:"required"`
	Goals                  []string        `bson:"goals" json:"goals" validate:"required,min=1,dive,required"`
	DietaryRestrictions    []string        `bson:"dietary_restrictions" json:"dietary_restrictions"`
	DailyCalorieIntake     int             `bson:"daily_calorie_intake" json:"daily_calorie_intake" validate:"required,min=1000,max=5000"`
	DailyProteinIntake     int             `bson:"daily_protein_intake" json:"daily_protein_intake" validate:"required,min=30,max=500"`
	FoodsToAvoid           []string        `bson:"foods_to_avoid" json:"foods_to_avoid"`
	Exercises              []bson.ObjectID `bson:"exercises" json:"exercises"`
	PreferredMealFrequency int             `bson:"preferred_meal_frequency" json:"preferred_meal_frequency" validate:"required,min=1,max=6"`
	CurrentFitnessLevel    string          `bson:"current_fitness_level" json:"current_fitness_level" validate:"required,oneof=Beginner Intermediate Advanced"`
	HealthConsiderations   []string        `bson:"health_considerations" json:"health_considerations"`
	InterestedActivities   []string        `bson:"interested_activities" json:"interested_activities"`
	DaysPerWeek            int             `bson:"days_per_week" json:"days_per_week" validate:"required,min=1,max=7"`
	MedicalConditions      []string        `bson:"medical_conditions" json:"medical_conditions"`
	FoodAllergies          []string        `bson:"food_allergies" json:"food_allergies"`
}

type UserLogin struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

func (u *User) Validate() error {
	validate := validator.New()
	return validate.Struct(u)
}
