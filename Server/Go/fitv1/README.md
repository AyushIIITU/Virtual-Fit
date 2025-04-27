# FitV1 - Fitness App Backend

A production-ready backend for a fitness application built with Go and MongoDB.

## Features

- User authentication and authorization
- Exercise management
- Workout tracking
- Progress monitoring
- RESTful API
- JWT-based authentication
- MongoDB integration
- CORS support
- Request logging

## Prerequisites

- Go 1.21 or higher
- MongoDB 4.4 or higher
- Git

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fitv1.git
cd fitv1
```

2. Install dependencies:
```bash
go mod download
```

3. Create a `.env` file in the root directory with the following content:
```
MONGO_URI=mongodb://localhost:27017
DB_NAME=fitv1
JWT_SECRET=your-secret-key-change-in-production
PORT=8080
```

4. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
```

5. Run the application:
```bash
go run cmd/main.go
```

## API Documentation

### Authentication

#### Register User
- **POST** `/api/v1/register`
- Request body:
```json
{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "height": 180,
    "weight": 75,
    "fitness_goal": "weight_loss",
    "activity_level": "moderate"
}
```

#### Login
- **POST** `/api/v1/login`
- Request body:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

### Exercises

#### Create Exercise
- **POST** `/api/v1/exercises`
- Requires authentication
- Request body:
```json
{
    "name": "Bench Press",
    "description": "A compound exercise for chest",
    "muscle_group": "chest",
    "equipment": "barbell",
    "difficulty": "intermediate",
    "instructions": ["Step 1", "Step 2"],
    "video_url": "https://example.com/video"
}
```

#### Get Exercise
- **GET** `/api/v1/exercises/:id`
- Requires authentication

#### List Exercises
- **GET** `/api/v1/exercises`
- Requires authentication
- Query parameters:
  - `muscle_group` (optional)
  - `difficulty` (optional)

### Workouts

#### Create Workout
- **POST** `/api/v1/workouts`
- Requires authentication
- Request body:
```json
{
    "name": "Chest Day",
    "description": "Upper body workout",
    "exercises": [
        {
            "exercise_id": "exercise_id_here",
            "sets": 3,
            "reps": 12,
            "weight": 60,
            "duration": 0,
            "notes": "Focus on form"
        }
    ],
    "duration": 60,
    "difficulty": "intermediate",
    "date": "2024-04-25T10:00:00Z"
}
```

#### Get Workout
- **GET** `/api/v1/workouts/:id`
- Requires authentication

#### List User Workouts
- **GET** `/api/v1/workouts`
- Requires authentication

### Progress

#### Record Progress
- **POST** `/api/v1/progress`
- Requires authentication
- Request body:
```json
{
    "workout_id": "workout_id_here",
    "date": "2024-04-25T10:00:00Z",
    "exercises": [
        {
            "exercise_id": "exercise_id_here",
            "sets": [
                {
                    "reps": 12,
                    "weight": 60
                }
            ],
            "notes": "Felt strong today"
        }
    ],
    "total_duration": 55
}
```

#### Get User Progress
- **GET** `/api/v1/progress`
- Requires authentication
- Query parameters:
  - `start_date` (YYYY-MM-DD)
  - `end_date` (YYYY-MM-DD)

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
    "error": "Error message description"
}
```

## Security

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is enabled for cross-origin requests
- Protected routes require valid JWT tokens

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 