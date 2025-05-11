package handlers

import (
	"net/http"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

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
