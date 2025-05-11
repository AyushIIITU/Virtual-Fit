package service

import (
	"context"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (s *Service) CreateExercise(ctx context.Context, exercise *models.Exercise) (*models.Exercise, error) {
	exercise.CreatedAt = time.Now()
	return s.repo.CreateExercise(ctx, exercise)
}

func (s *Service) GetExercise(ctx context.Context, id bson.ObjectID) (*models.Exercise, error) {
	return s.repo.GetExerciseByID(ctx, id)
}

func (s *Service) ListExercises(ctx context.Context) ([]*models.Exercise, error) {
	return s.repo.ListExercises(ctx, bson.M{})
}
