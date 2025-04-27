package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Task struct (like a Mongoose schema)
type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool   `json:"completed"`
}

func main() {
	// Hardcoded tasks (later we'll use MongoDB)
	tasks := []Task{
		{ID: "1", Title: "Learn Go", Description: "Master Go basics", Completed: false},
		{ID: "2", Title: "Build API", Description: "Create Task Manager API", Completed: false},
	}

	// Root handler
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Welcome to Task Manager API!")
	})

	// Tasks handler
	http.HandleFunc("/tasks", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Set JSON content type
		w.Header().Set("Content-Type", "application/json")

		// Encode tasks to JSON (like res.json in Express)
		if err := json.NewEncoder(w).Encode(tasks); err != nil {
			http.Error(w, "Failed to encode tasks", http.StatusInternalServerError)
			return
		}
	})

	// Start server
	port := "8080"
	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}