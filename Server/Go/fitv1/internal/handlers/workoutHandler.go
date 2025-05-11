package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/gin-gonic/gin"
)

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
