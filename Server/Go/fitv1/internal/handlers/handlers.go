package handlers

import (
	"net/http"
	"time"

	// "github.com/ayushIIITU/fitv1/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/service"
	"go.mongodb.org/mongo-driver/v2/bson"

	// "github.com/ayushIIITU/virtualfit/internal/service"
	"github.com/gin-gonic/gin"
	// "go.mongodb.org/mongo-driver/bson/bson"
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

	// TODO: Generate JWT token
	c.JSON(http.StatusOK, user)
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
	muscleGroup := c.Query("muscle_group")
	difficulty := c.Query("difficulty")

	exercises, err := h.service.ListExercises(c.Request.Context(), muscleGroup, difficulty)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, exercises)
}

// Workout Handlers
func (h *Handler) CreateWorkout(c *gin.Context) {
	var workout models.Workout
	if err := c.ShouldBindJSON(&workout); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	workout.UserID = userID.(bson.ObjectID)

	createdWorkout, err := h.service.CreateWorkout(c.Request.Context(), &workout)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdWorkout)
}

func (h *Handler) GetWorkout(c *gin.Context) {
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workout ID"})
		return
	}

	workout, err := h.service.GetWorkout(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "workout not found"})
		return
	}

	c.JSON(http.StatusOK, workout)
}

func (h *Handler) ListUserWorkouts(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	workouts, err := h.service.ListUserWorkouts(c.Request.Context(), userID.(bson.ObjectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workouts)
}

// Workout Progress Handlers
func (h *Handler) RecordProgress(c *gin.Context) {
	var progress models.WorkoutProgress
	if err := c.ShouldBindJSON(&progress); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	progress.UserID = userID.(bson.ObjectID)

	recordedProgress, err := h.service.RecordWorkoutProgress(c.Request.Context(), &progress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, recordedProgress)
}

func (h *Handler) GetUserProgress(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start date format"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end date format"})
		return
	}

	progress, err := h.service.GetUserProgress(c.Request.Context(), userID.(bson.ObjectID), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, progress)
} 