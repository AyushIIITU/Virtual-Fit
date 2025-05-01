package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
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
	foodIntake.UpdatedAt = time.Now()
	foodIntake.Status = false // Set initial status to false

	// Save the food intake record
	createdFoodIntake, err := s.repo.CreateFoodIntake(ctx, foodIntake)
	if err != nil {
		return nil, err
	}

	// Start processing the image in a goroutine
	go s.processFoodImage(createdFoodIntake)

	return createdFoodIntake, nil
}

// processFoodImage processes the food image asynchronously
func (s *Service) processFoodImage(foodIntake *models.FoodIntake) {
	// Create a new HTTP client
	client := &http.Client{}

	// Open the image file
	file, err := os.Open(foodIntake.ImagePath)
	if err != nil {
		fmt.Printf("Error opening image file: %v\n", err)
		return
	}
	defer file.Close()

	// Create a new multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	// Add the file to the form
	part, err := writer.CreateFormFile("file", filepath.Base(foodIntake.ImagePath))
	if err != nil {
		fmt.Printf("Error creating form file: %v\n", err)
		return
	}
	
	// Copy the file content to the form
	_, err = io.Copy(part, file)
	if err != nil {
		fmt.Printf("Error copying file content: %v\n", err)
		return
	}
	
	// Close the writer
	err = writer.Close()
	if err != nil {
		fmt.Printf("Error closing writer: %v\n", err)
		return
	}

	// Create the request
	req, err := http.NewRequest("POST", "http://localhost:8000/analyze-food", body)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}

	// Set headers
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("accept", "application/json")

	// Send the request
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return
	}

	// Parse the response
	var result struct {
		Status        string `json:"status"`
		Filename      string `json:"filename"`
		Classification string `json:"classification"`
		FoodName      string `json:"food_name"`
		Nutrition     struct {
			Name         string   `json:"name"`
			ID           int      `json:"id"`
			Ingredients  string   `json:"ingredients"`
			Nutrition    string   `json:"nutrition"`
			Description  string   `json:"description"`
		} `json:"nutrition"`
	}

	if err := json.Unmarshal(respBody, &result); err != nil {
		fmt.Printf("Error parsing response: %v\n", err)
		return
	}

	// Parse ingredients from string to array
	var ingredients []string
	if err := json.Unmarshal([]byte(result.Nutrition.Ingredients), &ingredients); err != nil {
		fmt.Printf("Error parsing ingredients: %v\n", err)
		return
	}

	// Parse nutrition values
	var nutritionValues []float64
	if err := json.Unmarshal([]byte(result.Nutrition.Nutrition), &nutritionValues); err != nil {
		fmt.Printf("Error parsing nutrition values: %v\n", err)
		return
	}

	// Create nutrients array
	nutrients := []models.Nutrient{
		{Name: "Calories", Amount: nutritionValues[0], Unit: "kcal"},
		{Name: "Protein", Amount: nutritionValues[1], Unit: "g"},
		{Name: "Fat", Amount: nutritionValues[2], Unit: "g"},
		{Name: "Saturated Fat", Amount: nutritionValues[3], Unit: "g"},
		{Name: "Carbohydrates", Amount: nutritionValues[4], Unit: "g"},
		{Name: "Fiber", Amount: nutritionValues[5], Unit: "g"},
		{Name: "Sugar", Amount: nutritionValues[6], Unit: "g"},
	}

	// Update the food intake with processed data
	ctx := context.Background()
	updatedFoodIntake := &models.FoodIntake{
		ID:          foodIntake.ID,
		FoodName:    result.FoodName,
		Nutrients:   nutrients,
		Ingredients: ingredients,
		Status:      true,
		UpdatedAt:   time.Now(),
	}

	err = s.repo.UpdateFoodIntake(ctx, updatedFoodIntake)
	if err != nil {
		fmt.Printf("Error updating food intake: %v\n", err)
	}
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
