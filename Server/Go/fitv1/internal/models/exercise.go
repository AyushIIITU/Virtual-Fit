package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Exercise struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	ExerciseName  string            `bson:"exercise_name" json:"exercise_name"`
	RepCount      string            `bson:"rep_count" json:"rep_count"`
	Description   string            `bson:"description" json:"description"`
	Time          time.Time         `bson:"time" json:"time"`
	CaloriBurn    *string           `bson:"calori_burn,omitempty" json:"calori_burn,omitempty"`
	CreatedAt     time.Time         `bson:"created_at" json:"created_at"`
} 