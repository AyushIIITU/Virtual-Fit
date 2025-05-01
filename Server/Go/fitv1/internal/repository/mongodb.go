package repository

import (
	"context"
	"time"

	"github.com/AyushIIITU/virtualfit/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
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

func (m *MongoDB) UpdateFoodIntake(ctx context.Context, foodIntake *models.FoodIntake) error {
	_, err := m.db.Collection("food_intakes").UpdateOne(
		ctx,
		bson.M{"_id": foodIntake.ID},
		bson.M{"$set": bson.M{
			"food_name":    foodIntake.FoodName,
			"nutrients":    foodIntake.Nutrients,
			"ingredients":  foodIntake.Ingredients,
			"status":       foodIntake.Status,
			"updated_at":   foodIntake.UpdatedAt,
		}},
	)
	return err
}

func (m *MongoDB) GetWorkout(ctx context.Context, nameFilter string) ([]*models.Workout, error) {
	collection := m.db.Collection("workouts")
	// Create a filter to search for workouts by name
	filter := bson.M{}
	if nameFilter != "" {
		// Case-insensitive search for name
		filter["name"] = bson.M{"$regex": nameFilter, "$options": "i"}
	}

	cursor, err := collection.Find(ctx, filter)
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

// GetWorkoutPaginated returns a paginated list of workouts and the total count
func (m *MongoDB) GetWorkoutPaginated(ctx context.Context, nameFilter string, limit, offset int) ([]*models.Workout, int64, error) {
	collection := m.db.Collection("workouts")
	
	// Create a filter to search for workouts by name
	filter := bson.M{}
	if nameFilter != "" {
		// Case-insensitive search for name
		filter["name"] = bson.M{"$regex": nameFilter, "$options": "i"}
	}

	// Get total count of documents matching the filter
	totalCount, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	// Set up pagination options
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	// Execute the query with pagination
	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	// Decode results
	var workouts []*models.Workout
	if err = cursor.All(ctx, &workouts); err != nil {
		return nil, 0, err
	}

	return workouts, totalCount, nil
}

// SearchWorkouts searches for workouts based on the provided criteria
func (m *MongoDB) SearchWorkouts(ctx context.Context, criteria models.WorkoutSearchCriteria) ([]*models.Workout, int64, error) {
	collection := m.db.Collection("workouts")
	
	// Build the filter based on search criteria
	filter := bson.M{}
	
	// Add name filter if provided
	if criteria.Name != "" {
		filter["name"] = bson.M{"$regex": criteria.Name, "$options": "i"}
	}
	
	// Add category filter if provided
	if criteria.Category != "" {
		filter["category"] = bson.M{"$regex": criteria.Category, "$options": "i"}
	}
	
	// Add level filter if provided
	if criteria.Level != "" {
		filter["level"] = bson.M{"$regex": criteria.Level, "$options": "i"}
	}
	
	// Add equipment filter if provided
	if criteria.Equipment != "" {
		filter["equipment"] = bson.M{"$regex": criteria.Equipment, "$options": "i"}
	}
	
	// Add force filter if provided
	if criteria.Force != "" {
		filter["force"] = bson.M{"$regex": criteria.Force, "$options": "i"}
	}
	
	// Add mechanic filter if provided
	if criteria.Mechanic != "" {
		filter["mechanic"] = bson.M{"$regex": criteria.Mechanic, "$options": "i"}
	}
	
	// Add muscle filter if provided (search in both primary and secondary muscles)
	if criteria.Muscle != "" {
		filter["$or"] = []bson.M{
			{"primaryMuscles": bson.M{"$regex": criteria.Muscle, "$options": "i"}},
			{"secondaryMuscles": bson.M{"$regex": criteria.Muscle, "$options": "i"}},
		}
	}

	// Get total count of documents matching the filter
	totalCount, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	// Set up pagination options
	opts := options.Find().
		SetLimit(int64(criteria.Limit)).
		SetSkip(int64(criteria.Offset))

	// Execute the query with pagination
	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	// Decode results
	var workouts []*models.Workout
	if err = cursor.All(ctx, &workouts); err != nil {
		return nil, 0, err
	}

	return workouts, totalCount, nil
}

func (m *MongoDB) GetWorkoutByID(ctx context.Context, id bson.ObjectID) (*models.Workout, error) {
	collection := m.db.Collection("workouts")
	workout := &models.Workout{}
	err := collection.FindOne(ctx, bson.M{"id": id}).Decode(workout)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return workout, nil
}
