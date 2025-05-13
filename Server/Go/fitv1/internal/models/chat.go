package models

import (
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Chat struct {
	ID       bson.ObjectID `bson:"_id,omitempty" json:"id"`
	SocketID string        `bson:"socket_id" json:"socket_id" validate:"required"`
	UserID   bson.ObjectID `bson:"user_id" json:"user_id" validate:"required"`
}
type SocketRequest struct {
	SocketID string `json:"socket_id"`
	UserID   string `json:"user_id"`
}

func (c *Chat) Validate() error {
	validate := validator.New()
	return validate.Struct(c)
}
