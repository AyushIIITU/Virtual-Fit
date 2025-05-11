package service

import (
	"context"
	"errors"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// User Service
func (s *Service) RegisterUser(ctx context.Context, userReg *models.UserRegister) (*models.User, error) {
	// Check if user already exists
	existingUser, err := s.repo.GetUserByEmail(ctx, userReg.Email)
	if err == nil && existingUser != nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userReg.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Parse date of birth
	// dob, err := time.Parse("2006-01-02", userReg.DateOfBirth)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:                   userReg.Name,
		Email:                  userReg.Email,
		PasswordHash:           string(hashedPassword),
		DOB:                    userReg.DateOfBirth,
		Gender:                 userReg.Gender,
		Height:                 userReg.Height,
		Weight:                 userReg.Weight,
		Region:                 userReg.Region,
		Goals:                  userReg.Goals,
		DietaryRestrictions:    userReg.DietaryRestrictions,
		DailyCalorieIntake:     userReg.DailyCalorieIntake,
		DailyProteinIntake:     userReg.DailyProteinIntake,
		Exercises:              userReg.Exercises,
		PreferredMealFrequency: userReg.PreferredMealFrequency,
		FoodsToAvoid:           userReg.FoodsToAvoid,
		CurrentFitnessLevel:    userReg.CurrentFitnessLevel,
		HealthConsiderations:   userReg.HealthConsiderations,
		MedicalConditions:      userReg.MedicalConditions,
		FoodAllergies:          userReg.FoodAllergies,
		InterestedActivities:   userReg.InterestedActivities,
		DaysPerWeek:            userReg.DaysPerWeek,

		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return s.repo.CreateUser(ctx, user)
}

func (s *Service) LoginUser(ctx context.Context, login *models.UserLogin) (*models.User, error) {
	user, err := s.repo.GetUserByEmail(ctx, login.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(login.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// User Profile Update Service
func (s *Service) UpdateUserProfile(ctx context.Context, user *models.User) error {
	return s.repo.UpdateUser(ctx, user)
}
