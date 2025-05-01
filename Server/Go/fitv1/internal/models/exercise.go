package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Exercise struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	WorkoutOut    bson.ObjectID `bson:"workouts" json:"workouts"`
	RepCount      string            `bson:"rep_count" json:"rep_count"`
	Time          time.Time         `bson:"time" json:"time"`
	CreatedAt     time.Time         `bson:"created_at" json:"created_at"`
} 