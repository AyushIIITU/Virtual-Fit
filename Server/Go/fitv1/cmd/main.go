package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/AyushIIITU/virtualfit/config"
	"github.com/AyushIIITU/virtualfit/internal/handlers"
	"github.com/AyushIIITU/virtualfit/internal/middleware"
	"github.com/AyushIIITU/virtualfit/internal/repository"
	"github.com/AyushIIITU/virtualfit/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize repository
	repo := repository.NewMongoDB(cfg.MongoClient, cfg.DatabaseName)

	// Initialize service
	svc := service.NewService(repo)

	// Initialize handler
	handler := handlers.NewHandler(svc)

	// Initialize router
	router := gin.Default()

	// Add middleware
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware())

	// Public routes
	public := router.Group("/api/v1")
	{
		public.POST("/register", handler.Register)
		public.POST("/login", handler.Login)
		// Workout routes
		public.GET("/workout", handler.ListWorkoutAPI)
		public.GET("/workout/search", handler.SearchWorkoutAPI)
		public.GET("/workout/:id/:imageName", handler.GetWorkoutImage)
		// Food image routes
		public.GET("/food-images/:filename", handler.ServeFoodImage)
	}

	// Protected routes
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// User routes
		protected.PUT("/profile", handler.UpdateProfile)
		protected.GET("/diet-plan-data", handler.GetDietPlanData)

		// Exercise routes
		protected.POST("/exercises", handler.CreateExercise)
		protected.GET("/exercises/:id", handler.GetExercise)
		protected.GET("/exercises", handler.ListExercises)

		// Food Intake routes
		protected.POST("/food-intake", handler.CreateFoodIntake)
		protected.GET("/food-intake/:id", handler.GetFoodIntakeStatus)
		protected.GET("/food-intake", handler.ListUserFoodIntake)

	}

	// Create server
	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Create shutdown context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Shutdown server
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
