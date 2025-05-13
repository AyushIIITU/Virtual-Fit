package repository

import (
	"context"
	"errors"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// SaveChat stores a chat record
func (m *MongoDB) SaveChat(ctx context.Context, chat *models.Chat) error {
	collection := m.db.Collection("chats")
	_, err := collection.InsertOne(ctx, chat)
	return err
}

// FindChatsByUserID retrieves all chats for a specific user
func (m *MongoDB) FindChatsByUserID(ctx context.Context, userID bson.ObjectID) ([]*models.Chat, error) {
	collection := m.db.Collection("chats")
	cursor, err := collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var chats []*models.Chat
	if err := cursor.All(ctx, &chats); err != nil {
		return nil, err
	}

	return chats, nil
}

// DeleteChatBySocketID removes a chat record by socket ID
func (m *MongoDB) DeleteChatBySocketID(ctx context.Context, socketID string) error {
	collection := m.db.Collection("chats")
	result, err := collection.DeleteOne(ctx, bson.M{"socket_id": socketID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("socket ID not found")
	}

	return nil
}
