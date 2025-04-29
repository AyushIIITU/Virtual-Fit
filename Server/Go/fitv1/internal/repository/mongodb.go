package repository

import (
	"context"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	// "go.mongodb.org/mongo-driver/bson"
	// "go.mongodb.org/mongo-driver/mongo"
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
	
	collection := m.db.Collection("users")
	result, err := collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}
	user.ID = result.InsertedID.(bson.ObjectID)
	return user, nil
}

func (m *MongoDB) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	collection := m.db.Collection("users")
	user := &models.User{}
	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (m *MongoDB) GetUserByID(ctx context.Context, id bson.ObjectID) (*models.User, error) {
	collection := m.db.Collection("users")
	user := &models.User{}
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(user)
	if err != nil {
		return nil, err
	}
	return user, nil
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
	
	collection := m.db.Collection("exercises")
	result, err := collection.InsertOne(ctx, exercise)
	if err != nil {
		return nil, err
	}
	exercise.ID = result.InsertedID.(bson.ObjectID)
	return exercise, nil
}

func (m *MongoDB) GetExerciseByID(ctx context.Context, id bson.ObjectID) (*models.Exercise, error) {
	collection := m.db.Collection("exercises")
	exercise := &models.Exercise{}
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(exercise)
	if err != nil {
		return nil, err
	}
	return exercise, nil
}

func (m *MongoDB) ListExercises(ctx context.Context, filter bson.M) ([]*models.Exercise, error) {
	collection := m.db.Collection("exercises")
	cursor, err := collection.Find(ctx, filter)
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

// Food Intake Repository
func (m *MongoDB) CreateFoodIntake(ctx context.Context, foodIntake *models.FoodIntake) (*models.FoodIntake, error) {
	foodIntake.CreatedAt = time.Now()
	
	collection := m.db.Collection("food_intakes")
	result, err := collection.InsertOne(ctx, foodIntake)
	if err != nil {
		return nil, err
	}
	foodIntake.ID = result.InsertedID.(bson.ObjectID)
	return foodIntake, nil
}

func (m *MongoDB) GetFoodIntakeByID(ctx context.Context, id bson.ObjectID) (*models.FoodIntake, error) {
	collection := m.db.Collection("food_intakes")
	foodIntake := &models.FoodIntake{}
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(foodIntake)
	if err != nil {
		return nil, err
	}
	return foodIntake, nil
}

func (m *MongoDB) ListUserFoodIntake(ctx context.Context, userID bson.ObjectID) ([]*models.FoodIntake, error) {
	collection := m.db.Collection("food_intakes")
	cursor, err := collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var foodIntakes []*models.FoodIntake
	if err = cursor.All(ctx, &foodIntakes); err != nil {
		return nil, err
	}
	return foodIntakes, nil
}
