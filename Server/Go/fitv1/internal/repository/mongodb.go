package repository

import (
	"context"
	"time"

	// "github.com/ayushIIITU/fitv1/internal/models"
	"github.com/AyushIIITU/virtualfit/internal/models"
	// "go.mongodb.org/mongo-driver/bson/bson"
	"go.mongodb.org/mongo-driver/v2/bson"

	// "go.mongodb.org/mongo-driver/v2/bson/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	// "go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoDB struct {
	client *mongo.Client
	db     *mongo.Database
}

func NewMongoDB(client *mongo.Client, dbName string) *MongoDB {
	return &MongoDB{
		client: client,
		db:     client.Database(dbName),
	}
}

// User Repository
func (m *MongoDB) CreateUser(ctx context.Context, user *models.User) (*models.User, error) {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	result, err := m.db.Collection("users").InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}

	user.ID = result.InsertedID.(bson.ObjectID)
	return user, nil
}

func (m *MongoDB) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := m.db.Collection("users").FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (m *MongoDB) GetUserByID(ctx context.Context, id bson.ObjectID) (*models.User, error) {
	var user models.User
	err := m.db.Collection("users").FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (m *MongoDB) UpdateUser(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()
	_, err := m.db.Collection("users").UpdateOne(
		ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": user},
	)
	return err
}

// Exercise Repository
func (m *MongoDB) CreateExercise(ctx context.Context, exercise *models.Exercise) (*models.Exercise, error) {
	exercise.CreatedAt = time.Now()
	exercise.UpdatedAt = time.Now()

	result, err := m.db.Collection("exercises").InsertOne(ctx, exercise)
	if err != nil {
		return nil, err
	}

	exercise.ID = result.InsertedID.(bson.ObjectID)
	return exercise, nil
}

func (m *MongoDB) GetExerciseByID(ctx context.Context, id bson.ObjectID) (*models.Exercise, error) {
	var exercise models.Exercise
	err := m.db.Collection("exercises").FindOne(ctx, bson.M{"_id": id}).Decode(&exercise)
	if err != nil {
		return nil, err
	}
	return &exercise, nil
}

func (m *MongoDB) ListExercises(ctx context.Context, filter bson.M) ([]*models.Exercise, error) {
	cursor, err := m.db.Collection("exercises").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var exercises []*models.Exercise
	if err = cursor.All(ctx, &exercises); err != nil {
		return nil, err
	}
	return exercises, nil
}

// Workout Repository
func (m *MongoDB) CreateWorkout(ctx context.Context, workout *models.Workout) (*models.Workout, error) {
	workout.CreatedAt = time.Now()
	workout.UpdatedAt = time.Now()

	result, err := m.db.Collection("workouts").InsertOne(ctx, workout)
	if err != nil {
		return nil, err
	}

	workout.ID = result.InsertedID.(bson.ObjectID)
	return workout, nil
}

func (m *MongoDB) GetWorkoutByID(ctx context.Context, id bson.ObjectID) (*models.Workout, error) {
	var workout models.Workout
	err := m.db.Collection("workouts").FindOne(ctx, bson.M{"_id": id}).Decode(&workout)
	if err != nil {
		return nil, err
	}
	return &workout, nil
}

func (m *MongoDB) ListUserWorkouts(ctx context.Context, userID bson.ObjectID) ([]*models.Workout, error) {
	cursor, err := m.db.Collection("workouts").Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var workouts []*models.Workout
	if err = cursor.All(ctx, &workouts); err != nil {
		return nil, err
	}
	return workouts, nil
}

// Workout Progress Repository
func (m *MongoDB) CreateWorkoutProgress(ctx context.Context, progress *models.WorkoutProgress) (*models.WorkoutProgress, error) {
	progress.CreatedAt = time.Now()
	progress.UpdatedAt = time.Now()

	result, err := m.db.Collection("workout_progress").InsertOne(ctx, progress)
	if err != nil {
		return nil, err
	}

	progress.ID = result.InsertedID.(bson.ObjectID)
	return progress, nil
}

func (m *MongoDB) GetUserProgress(ctx context.Context, userID bson.ObjectID) ([]*models.WorkoutProgress, error) {
	cursor, err := m.db.Collection("workout_progress").Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var progress []*models.WorkoutProgress
	if err = cursor.All(ctx, &progress); err != nil {
		return nil, err
	}
	return progress, nil
}
