package handlers

import (
	"net/http"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// StoreSocketID handles the storing of a socket ID
func (h *Handler) StoreSocketID(c *gin.Context) {
	var req models.SocketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := bson.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	chat := &models.Chat{
		SocketID: req.SocketID,
		UserID:   userID,
	}

	if err := h.service.StoreSocketID(c.Request.Context(), chat); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Socket ID stored successfully"})
}

// GetAllSocketIDs retrieves all socket IDs for a user
func (h *Handler) GetAllSocketIDs(c *gin.Context) {
	userIDStr := c.Param("id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	userID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	socketIDs, err := h.service.GetAllSocketIDsByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve socket IDs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"socket_ids": socketIDs})
}

// DisconnectSocket removes a socket connection
func (h *Handler) DisconnectSocket(c *gin.Context) {
	socketID := c.Param("socketID")
	if socketID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Socket ID is required"})
		return
	}

	if err := h.service.DisconnectSocket(c.Request.Context(), socketID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Socket disconnected successfully"})
}
