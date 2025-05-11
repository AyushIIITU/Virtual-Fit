package service

import (
	"context"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"

	// "go.mongodb.org/mongo-driver/bson"
	// "go.mongodb.org/mongo-driver/bson/bson"

	"github.com/sirupsen/logrus"
)

var log = logrus.New()

type Service struct {
	repo *repository.MongoDB
}

func NewService(repo *repository.MongoDB) *Service {
	return &Service{repo: repo}
}

// Exercise Service

// GetDietPlanData returns user data needed for diet planning
func (s *Service) GetDietPlanData(ctx context.Context, userID bson.ObjectID) (*models.DietPlanData, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	dietPlanData := &models.DietPlanData{
		ID:                     user.ID,
		Name:                   user.Name,
		Email:                  user.Email,
		Age:                    int(time.Now().Sub(user.DOB).Hours() / 24 / 365.25),
		Gender:                 user.Gender,
		Height:                 user.Height,
		Weight:                 user.Weight,
		Goals:                  user.Goals,
		DietaryRestrictions:    user.DietaryRestrictions,
		DailyCalorieIntake:     user.DailyCalorieIntake,
		DailyProteinIntake:     user.DailyProteinIntake,
		FoodsToAvoid:           user.FoodsToAvoid,
		CurrentFitnessLevel:    user.CurrentFitnessLevel,
		HealthConsiderations:   user.HealthConsiderations,
		MedicalConditions:      user.MedicalConditions,
		FoodAllergies:          user.FoodAllergies,
		InterestedActivities:   user.InterestedActivities,
		DaysPerWeek:            user.DaysPerWeek,
		PreferredMealFrequency: user.PreferredMealFrequency,
	}

	return dietPlanData, nil
}
