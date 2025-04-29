package service

import (
	"context"
	"errors"
	"path/filepath"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"

	// "go.mongodb.org/mongo-driver/bson"
	// "go.mongodb.org/mongo-driver/bson/bson"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *repository.MongoDB
}

func NewService(repo *repository.MongoDB) *Service {
	return &Service{repo: repo}
}

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

// Exercise Service
func (s *Service) CreateExercise(ctx context.Context, exercise *models.Exercise) (*models.Exercise, error) {
	exercise.CreatedAt = time.Now()
	return s.repo.CreateExercise(ctx, exercise)
}

func (s *Service) GetExercise(ctx context.Context, id bson.ObjectID) (*models.Exercise, error) {
	return s.repo.GetExerciseByID(ctx, id)
}

func (s *Service) ListExercises(ctx context.Context) ([]*models.Exercise, error) {
	return s.repo.ListExercises(ctx, bson.M{})
}

// Food Intake Service
func (s *Service) CreateFoodIntake(ctx context.Context, foodIntake *models.FoodIntake) (*models.FoodIntake, error) {
	foodIntake.CreatedAt = time.Now()
	return s.repo.CreateFoodIntake(ctx, foodIntake)
}

func (s *Service) GetFoodIntake(ctx context.Context, id bson.ObjectID) (*models.FoodIntake, error) {
	return s.repo.GetFoodIntakeByID(ctx, id)
}

func (s *Service) ListUserFoodIntake(ctx context.Context, userID bson.ObjectID) ([]*models.FoodIntake, error) {
	return s.repo.ListUserFoodIntake(ctx, userID)
}

// User Profile Update Service
func (s *Service) UpdateUserProfile(ctx context.Context, user *models.User) error {
	return s.repo.UpdateUser(ctx, user)
}

func (s *Service) GetWorkout(ctx context.Context, nameFilter string) ([]*models.Workout, error) {
	return s.repo.GetWorkout(ctx, nameFilter)
}

// GetWorkoutPaginated returns a paginated list of workouts and the total count
func (s *Service) GetWorkoutPaginated(ctx context.Context, nameFilter string, limit, offset int) ([]*models.Workout, int64, error) {
	return s.repo.GetWorkoutPaginated(ctx, nameFilter, limit, offset)
}

// SearchWorkouts searches for workouts based on the provided criteria
func (s *Service) SearchWorkouts(ctx context.Context, criteria models.WorkoutSearchCriteria) ([]*models.Workout, int64, error) {
	return s.repo.SearchWorkouts(ctx, criteria)
}

func (s *Service) GetWorkoutByID(ctx context.Context, id bson.ObjectID) (*models.Workout, error) {
	return s.repo.GetWorkoutByID(ctx, id)
}

func (s *Service) GetWorkoutImagePath(workoutId, imageName string) string {
	baseImagesPath := "../uploads/workout_images"
	return filepath.Join(baseImagesPath, workoutId, imageName)
}
