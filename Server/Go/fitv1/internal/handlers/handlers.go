package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"

	// "github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Handler struct {
	service *service.Service
}

func NewHandler(service *service.Service) *Handler {
	return &Handler{service: service}
}

// User Handlers
func (h *Handler) Register(c *gin.Context) {
	var userReg models.UserRegister
	if err := c.ShouldBindJSON(&userReg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.RegisterUser(c.Request.Context(), &userReg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *Handler) Login(c *gin.Context) {
	var login models.UserLogin
	if err := c.ShouldBindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.LoginUser(c.Request.Context(), &login)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	})

	// Sign the token with the secret key
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return user data and token
	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": tokenString,
	})
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user.ID = userID.(bson.ObjectID)

	err := h.service.UpdateUserProfile(c.Request.Context(), &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "profile updated successfully"})
}

// Exercise Handlers
func (h *Handler) CreateExercise(c *gin.Context) {
	var exercise models.Exercise
	if err := c.ShouldBindJSON(&exercise); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdExercise, err := h.service.CreateExercise(c.Request.Context(), &exercise)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdExercise)
}

func (h *Handler) GetExercise(c *gin.Context) {
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid exercise ID"})
		return
	}

	exercise, err := h.service.GetExercise(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "exercise not found"})
		return
	}

	c.JSON(http.StatusOK, exercise)
}

func (h *Handler) ListExercises(c *gin.Context) {
	exercises, err := h.service.ListExercises(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, exercises)
}

// Food Intake Handlers
func (h *Handler) CreateFoodIntake(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Get the uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image is required"})
		return
	}

	// Create uploads directory if it doesn't exist
	uploadDir := "uploads/food_images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload directory"})
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s_%s", userID.(bson.ObjectID).Hex(), file.Filename)
	filepath := filepath.Join(uploadDir, filename)

	// Save the file
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image"})
		return
	}

	// Create food intake record
	foodIntake := &models.FoodIntake{
		UserID:    userID.(bson.ObjectID),
		ImagePath: filepath,
		Status:    false,
	}

	// Save to database and start processing
	createdFoodIntake, err := h.service.CreateFoodIntake(c.Request.Context(), foodIntake)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Food image uploaded and processing started",
		"food_id": createdFoodIntake.ID,
		"status":  "processing",
	})
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

	// If processing is complete, return full details
	if foodIntake.Status {
		c.JSON(http.StatusOK, foodIntake)
		return
	}

	// If still processing, return minimal info
	c.JSON(http.StatusOK, gin.H{
		"id":     foodIntake.ID,
		"status": "processing",
	})
}

func (h *Handler) ListWorkoutAPI(c *gin.Context) {
	ctx := c.Request.Context()

	// Get pagination parameters from query
	nameFilter := c.Query("name")
	limitStr := c.DefaultQuery("limit", "10")  // Default limit of 10 items per page
	offsetStr := c.DefaultQuery("offset", "0") // Default offset of 0

	// Convert string parameters to integers
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10 // Default to 10 if invalid
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0 // Default to 0 if invalid
	}

	// Get workouts with pagination
	workouts, totalCount, err := h.service.GetWorkoutPaginated(ctx, nameFilter, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workouts"})
		return
	}

	// Convert workouts to response format
	var response []models.WorkoutResponse
	for _, workout := range workouts {
		// Use the ID_Default field which is already a string
		workoutResponse := models.WorkoutResponse{
			ID:               workout.ID_Default,
			Name:             workout.Name,
			Force:            workout.Force,
			Level:            workout.Level,
			Mechanic:         workout.Mechanic,
			Equipment:        workout.Equipment,
			PrimaryMuscles:   workout.PrimaryMuscles,
			SecondaryMuscles: workout.SecondaryMuscles,
			Instructions:     workout.Instructions,
			Category:         workout.Category,
			Images:           workout.Images,
		}
		response = append(response, workoutResponse)
	}

	// Return paginated response with metadata
	c.JSON(http.StatusOK, gin.H{
		"data": response,
		"pagination": gin.H{
			"total":   totalCount,
			"limit":   limit,
			"offset":  offset,
			"hasMore": offset+limit < int(totalCount),
		},
	})
}

// SearchWorkoutAPI handles searching for workouts with various criteria
func (h *Handler) SearchWorkoutAPI(c *gin.Context) {
	ctx := c.Request.Context()

	// Get search parameters from query
	nameFilter := c.Query("name")
	categoryFilter := c.Query("category")
	levelFilter := c.Query("level")
	equipmentFilter := c.Query("equipment")
	forceFilter := c.Query("force")
	mechanicFilter := c.Query("mechanic")
	muscleFilter := c.Query("muscle") // For searching in primary or secondary muscles

	// Get pagination parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	// Convert string parameters to integers
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10 // Default to 10 if invalid
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0 // Default to 0 if invalid
	}

	// Create search criteria
	searchCriteria := models.WorkoutSearchCriteria{
		Name:      nameFilter,
		Category:  categoryFilter,
		Level:     levelFilter,
		Equipment: equipmentFilter,
		Force:     forceFilter,
		Mechanic:  mechanicFilter,
		Muscle:    muscleFilter,
		Limit:     limit,
		Offset:    offset,
	}

	// Search workouts with criteria
	workouts, totalCount, err := h.service.SearchWorkouts(ctx, searchCriteria)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search workouts"})
		return
	}

	// Convert workouts to response format
	var response []models.WorkoutResponse
	for _, workout := range workouts {
		workoutResponse := models.WorkoutResponse{
			ID:               workout.ID_Default,
			Name:             workout.Name,
			Force:            workout.Force,
			Level:            workout.Level,
			Mechanic:         workout.Mechanic,
			Equipment:        workout.Equipment,
			PrimaryMuscles:   workout.PrimaryMuscles,
			SecondaryMuscles: workout.SecondaryMuscles,
			Instructions:     workout.Instructions,
			Category:         workout.Category,
			Images:           workout.Images,
		}
		response = append(response, workoutResponse)
	}

	// Return paginated response with metadata
	c.JSON(http.StatusOK, gin.H{
		"data": response,
		"pagination": gin.H{
			"total":   totalCount,
			"limit":   limit,
			"offset":  offset,
			"hasMore": offset+limit < int(totalCount),
		},
	})
}

func (h *Handler) GetWorkoutImage(c *gin.Context) {
	id := c.Param("id")
	imageName := c.Param("imageName")

	// No need to convert to ObjectID since we're using the string ID directly
	imagePath := h.service.GetWorkoutImagePath(id, imageName)
	fmt.Println("Image Path:", imagePath)
	// Check if file exists
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Determine content type
	ext := filepath.Ext(imagePath)
	contentType := "image/jpeg" // Default

	switch ext {
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	}

	c.Header("Content-Type", contentType)
	c.File(imagePath)
}

// GetDietPlanData returns user data needed for diet planning
func (h *Handler) GetDietPlanData(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	dietPlanData, err := h.service.GetDietPlanData(c.Request.Context(), userID.(bson.ObjectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dietPlanData)
}
