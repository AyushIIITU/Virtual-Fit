package service

import (
	"context"
	"errors"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
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

	// Parse date of birth (assuming UserRegister has a DateOfBirth field)
	dob, err := time.Parse("2006-01-02", userReg.DateOfBirth)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:          userReg.Email,
		Password:       string(hashedPassword),
		FirstName:      userReg.FirstName,
		LastName:       userReg.LastName,
		DateOfBirth:    dob,
		Gender:         userReg.Gender,
		Height:         userReg.Height,
		Weight:         userReg.Weight,
		FitnessGoal:    userReg.FitnessGoal,
		ActivityLevel:  userReg.ActivityLevel,
		ProfilePicture: userReg.ProfilePicture,
	}

	return s.repo.CreateUser(ctx, user)
}

func (s *Service) LoginUser(ctx context.Context, login *models.UserLogin) (*models.User, error) {
	user, err := s.repo.GetUserByEmail(ctx, login.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(login.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// Exercise Service
func (s *Service) CreateExercise(ctx context.Context, exercise *models.Exercise) (*models.Exercise, error) {
	exercise.CreatedAt = time.Now()
	exercise.UpdatedAt = time.Now()
	return s.repo.CreateExercise(ctx, exercise)
}

func (s *Service) GetExercise(ctx context.Context, id bson.ObjectID) (*models.Exercise, error) {
	return s.repo.GetExerciseByID(ctx, id)
}

func (s *Service) ListExercises(ctx context.Context, muscleGroup string, difficulty string) ([]*models.Exercise, error) {
	filter := bson.M{}
	if muscleGroup != "" {
		filter["muscle_group"] = muscleGroup
	}
	if difficulty != "" {
		filter["difficulty"] = difficulty
	}

	// opts := options.Find().SetSort(bson.D{{Key: "name", Value: 1}})
	return s.repo.ListExercises(ctx, filter)
}

// Workout Service
func (s *Service) CreateWorkout(ctx context.Context, workout *models.Workout) (*models.Workout, error) {
	// Validate exercises exist
	for _, exercise := range workout.Exercises {
		_, err := s.repo.GetExerciseByID(ctx, exercise.ExerciseID)
		if err != nil {
			return nil, errors.New("invalid exercise ID: " + exercise.ExerciseID.Hex())
		}
	}

	workout.CreatedAt = time.Now()
	workout.UpdatedAt = time.Now()
	return s.repo.CreateWorkout(ctx, workout)
}

func (s *Service) GetWorkout(ctx context.Context, id bson.ObjectID) (*models.Workout, error) {
	return s.repo.GetWorkoutByID(ctx, id)
}

func (s *Service) ListUserWorkouts(ctx context.Context, userID bson.ObjectID) ([]*models.Workout, error) {
	filter := userID
	// opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})
	return s.repo.ListUserWorkouts(ctx, filter)
}

// Workout Progress Service
func (s *Service) RecordWorkoutProgress(ctx context.Context, progress *models.WorkoutProgress) (*models.WorkoutProgress, error) {
	// Validate workout exists
	_, err := s.repo.GetWorkoutByID(ctx, progress.WorkoutID)
	if err != nil {
		return nil, errors.New("invalid workout ID")
	}

	progress.CreatedAt = time.Now()
	progress.UpdatedAt = time.Now()
	return s.repo.CreateWorkoutProgress(ctx, progress)
}

func (s *Service) GetUserProgress(ctx context.Context, userID bson.ObjectID, startDate, endDate time.Time) ([]*models.WorkoutProgress, error) {
	filter := userID
	// opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})
	return s.repo.GetUserProgress(ctx, filter)
}
