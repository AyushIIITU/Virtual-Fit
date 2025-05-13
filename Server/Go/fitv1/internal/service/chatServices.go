package service

import (
	"context"

	// "github.com/AyushIIITU/virtualfit/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// StoreSocketID saves a new socket ID for a user
func (s *Service) StoreSocketID(ctx context.Context, chat *models.Chat) error {
	if err := chat.Validate(); err != nil {
		return err
	}

	return s.repo.SaveChat(ctx, chat)
}

// GetAllSocketIDsByUserID retrieves all socket IDs for a specific user
func (s *Service) GetAllSocketIDsByUserID(ctx context.Context, userID bson.ObjectID) ([]string, error) {
	chats, err := s.repo.FindChatsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	socketIDs := make([]string, len(chats))
	for i, chat := range chats {
		socketIDs[i] = chat.SocketID
	}

	return socketIDs, nil
}

// DisconnectSocket removes a socket connection
func (s *Service) DisconnectSocket(ctx context.Context, socketID string) error {
	return s.repo.DeleteChatBySocketID(ctx, socketID)
}
