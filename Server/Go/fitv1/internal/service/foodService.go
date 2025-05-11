package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

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
	go s.ProcessFoodImage(createdFoodIntake)

	return createdFoodIntake, nil
}

// ProcessFoodImage processes the food image asynchronously
func (s *Service) ProcessFoodImage(foodIntake *models.FoodIntake) {
	log.Printf("Starting food image processing for food intake ID: %s", foodIntake.ID)

	// Create a new HTTP client
	client := &http.Client{}

	// Open the image file
	log.Printf("Opening image file: %s", foodIntake.ImagePath)
	file, err := os.Open(foodIntake.ImagePath)
	if err != nil {
		log.Printf("Error opening image file: %v", err)
		return
	}
	defer file.Close()

	// Create a new multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create the form file part
	log.Printf("Creating form file for upload")
	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", fmt.Sprintf(`form-data; name="%s"; filename="%s"`, "file", filepath.Base(foodIntake.ImagePath)))
	h.Set("Content-Type", "image/webp")

	part, err := writer.CreatePart(h)
	if err != nil {
		log.Printf("Error creating form part: %v", err)
		return
	}

	// Copy the file content to the form
	log.Printf("Copying file content to form")
	_, err = io.Copy(part, file)
	if err != nil {
		log.Printf("Error copying file content: %v", err)
		return
	}

	// Close the writer
	err = writer.Close()
	if err != nil {
		log.Printf("Error closing writer: %v", err)
		return
	}

	// Create the request
	log.Printf("Creating API request")
	req, err := http.NewRequest("POST", "http://localhost:8000/analyze-food", body)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		return
	}

	// Set headers exactly as shown in the API documentation
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("accept", "application/json")

	// Send the request
	log.Printf("Sending request to food analysis API with headers: %v", req.Header)
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending request: %v", err)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	log.Printf("Reading API response")
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response: %v", err)
		return
	}

	log.Printf("API Response Status: %d", resp.StatusCode)
	log.Printf("API Response Body: %s", string(respBody))

	if resp.StatusCode != http.StatusOK {
		log.Printf("API returned error status: %d", resp.StatusCode)
		return
	}

	// Parse the response
	var result struct {
		Status    string `json:"status"`
		FoodName  string `json:"food_name"`
		Nutrition struct {
			Name        string `json:"name"`
			ID          int    `json:"id"`
			Ingredients string `json:"ingredients"`
			Nutrition   string `json:"nutrition"`
		} `json:"nutrition"`
	}

	if err := json.Unmarshal(respBody, &result); err != nil {
		log.Printf("Error parsing response JSON: %v", err)
		return
	}

	// Parse ingredients - handle single quotes
	ingredientsStr := result.Nutrition.Ingredients
	// Remove the single quotes and brackets
	ingredientsStr = strings.Trim(ingredientsStr, "[]'")
	// Split by ', ' and clean up each ingredient
	ingredients := strings.Split(ingredientsStr, "', '")
	for i := range ingredients {
		// Remove any remaining single quotes
		ingredients[i] = strings.Trim(ingredients[i], "'")
	}

	log.Printf("Parsed ingredients: %v", ingredients)

	// Parse nutrition values - handle single quotes
	nutritionStr := result.Nutrition.Nutrition
	// Remove the brackets and any single quotes
	nutritionStr = strings.Trim(nutritionStr, "[]'")
	// Split by comma and parse each number
	nutritionParts := strings.Split(nutritionStr, ", ")
	var nutritionValues []float64
	for _, part := range nutritionParts {
		value, err := strconv.ParseFloat(strings.TrimSpace(part), 64)
		if err != nil {
			log.Printf("Error parsing nutrition value %s: %v", part, err)
			return
		}
		nutritionValues = append(nutritionValues, value)
	}

	log.Printf("Parsed nutrition values: %v", nutritionValues)

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
		ID:        foodIntake.ID,
		UserID:    foodIntake.UserID,
		ImagePath: foodIntake.ImagePath,
		FoodName:  result.FoodName,
		Nutrients: nutrients,

		Ingredients: ingredients,
		Status:      true,
		UpdatedAt:   time.Now(),
	}

	log.Printf("Updating food intake record with processed data")
	err = s.repo.UpdateFoodIntake(ctx, updatedFoodIntake)
	if err != nil {
		log.Printf("Error updating food intake: %v", err)
		return
	}

	log.Printf("Successfully completed food image processing for food intake ID: %s", foodIntake.ID)
}

func (s *Service) GetFoodIntake(ctx context.Context, id bson.ObjectID) (*models.FoodIntake, error) {
	return s.repo.GetFoodIntakeByID(ctx, id)
}

func (s *Service) ListUserFoodIntake(ctx context.Context, userID bson.ObjectID) ([]*models.FoodIntake, error) {
	return s.repo.ListUserFoodIntake(ctx, userID)
}
