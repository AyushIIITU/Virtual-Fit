package handlers

import (
	"net/http"

	// "github.com/AyushIIITU/virtualfit/internal/models"
	// "github.com/AyushIIITU/virtualfit/internal/models"

	// "github.com/AyushIIITU/virtualfit/internal/service"
	"github.com/AyushIIITU/virtualfit/internal/service"
	"github.com/gin-gonic/gin"

	// "github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Handler struct {
	service *service.Service
}

func NewHandler(service *service.Service) *Handler {
	return &Handler{service: service}
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
