package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// Food Intake Handlers
func (h *Handler) CreateFoodIntake(c *gin.Context) {
	log.Printf("Starting food intake creation")

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("Unauthorized request - no user ID in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Get the uploaded file
	log.Printf("Getting uploaded file from request")
	file, err := c.FormFile("image")
	if err != nil {
		log.Printf("Error getting file from request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "image is required"})
		return
	}

	// Create uploads directory if it doesn't exist
	uploadDir := "uploads/food_images"
	log.Printf("Creating upload directory: %s", uploadDir)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("Error creating upload directory: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload directory"})
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s_%s", userID.(bson.ObjectID).Hex(), file.Filename)
	filepath := filepath.Join(uploadDir, filename)
	log.Printf("Generated file path: %s", filepath)

	// Save the file
	log.Printf("Saving uploaded file")
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		log.Printf("Error saving uploaded file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image"})
		return
	}

	// Create image URL
	imageURL := fmt.Sprintf("/api/v1/food-images/%s", filename)

	// Create food intake record
	log.Printf("Creating food intake record")
	foodIntake := &models.FoodIntake{
		UserID:    userID.(bson.ObjectID),
		ImagePath: filepath,
		Status:    false,
	}

	// Save to database and start processing
	log.Printf("Saving food intake to database")
	createdFoodIntake, err := h.service.CreateFoodIntake(c.Request.Context(), foodIntake)
	if err != nil {
		log.Printf("Error creating food intake: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Successfully created food intake with ID: %s", createdFoodIntake.ID)
	c.JSON(http.StatusCreated, gin.H{
		"message":  "Food image uploaded and processing started",
		"food_id":  createdFoodIntake.ID,
		"status":   "processing",
		"imageUrl": imageURL,
	})
}

// ServeFoodImage serves food images
func (h *Handler) ServeFoodImage(c *gin.Context) {
	filename := c.Param("filename")
	filePath := filepath.Join("uploads/food_images", filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "image not found"})
		return
	}

	// Determine content type
	ext := strings.ToLower(filepath.Ext(filePath))
	contentType := "image/jpeg" // Default
	switch ext {
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	case ".webp":
		contentType = "image/webp"
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	}

	c.Header("Content-Type", contentType)
	c.File(filePath)
}

func (h *Handler) GetFoodIntake(c *gin.Context) {
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid food intake ID"})
		return
	}

	foodIntake, err := h.service.GetFoodIntake(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "food intake not found"})
		return
	}

	c.JSON(http.StatusOK, foodIntake)
}

func (h *Handler) ListUserFoodIntake(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	foodIntakes, err := h.service.ListUserFoodIntake(c.Request.Context(), userID.(bson.ObjectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, foodIntakes)
}

func (h *Handler) GetFoodIntakeStatus(c *gin.Context) {
	log.Printf("Getting food intake status")

	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		log.Printf("Invalid food intake ID: %s", c.Param("id"))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid food intake ID"})
		return
	}

	log.Printf("Fetching food intake with ID: %s", id.Hex())
	foodIntake, err := h.service.GetFoodIntake(c.Request.Context(), id)
	if err != nil {
		log.Printf("Error fetching food intake: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "food intake not found"})
		return
	}

	// If processing is complete, return full details
	if foodIntake.Status {
		log.Printf("Food intake processing complete, returning full details")
		c.JSON(http.StatusOK, foodIntake)
		return
	}

	// If still processing, return minimal info
	log.Printf("Food intake still processing")
	c.JSON(http.StatusOK, gin.H{
		"id":     foodIntake.ID,
		"status": "processing",
	})
}
