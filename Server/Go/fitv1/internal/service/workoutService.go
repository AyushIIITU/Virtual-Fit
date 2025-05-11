package service

import (
	"context"
	"path/filepath"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (s *Service) GetWorkout(ctx context.Context, nameFilter string) ([]*models.Workout, error) {
	return s.repo.GetWorkout(ctx, nameFilter)
}

// GetWorkoutPaginated returns a paginated list of workouts and the total count
func (s *Service) GetWorkoutPaginated(ctx context.Context, nameFilter string, limit, offset int) ([]*models.Workout, int64, error) {
	return s.repo.GetWorkoutPaginated(ctx, nameFilter, limit, offset)
}

// SearchWorkouts searches for workouts based on the provided criteria
func (s *Service) SearchWorkouts(ctx context.Context, criteria models.WorkoutSearchCriteria) ([]*models.Workout, int64, error) {
	return s.repo.SearchWorkouts(ctx, criteria)
}

func (s *Service) GetWorkoutByID(ctx context.Context, id bson.ObjectID) (*models.Workout, error) {
	return s.repo.GetWorkoutByID(ctx, id)
}

func (s *Service) GetWorkoutImagePath(workoutId, imageName string) string {
	baseImagesPath := "../uploads/workout_images"
	return filepath.Join(baseImagesPath, workoutId, imageName)
}
