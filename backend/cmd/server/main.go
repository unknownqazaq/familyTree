package main

import (
	"fmt"
	"log"
	"os"

	"family-tree/internal/config"
	"family-tree/internal/handlers"
	"family-tree/internal/middleware"
	"family-tree/internal/repository"
	"family-tree/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := sqlx.Connect("postgres", cfg.DBDSN)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := runMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Repositories
	userRepo := repository.NewUserRepository(db)
	personRepo := repository.NewPersonRepository(db)

	// Services
	authService := services.NewAuthService(userRepo, cfg)
	treeService := services.NewTreeService(personRepo)
	backupService := services.NewBackupService(cfg)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	personHandler := handlers.NewPersonHandler(personRepo)
	treeHandler := handlers.NewTreeHandler(treeService)
	adminHandler := handlers.NewAdminHandler(personRepo, backupService)

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
		}

		// Auth routes (protected)
		authProtected := api.Group("/auth")
		authProtected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			authProtected.POST("/logout", authHandler.Logout)
			authProtected.GET("/me", authHandler.Me)
			authProtected.PUT("/settings", authHandler.UpdateSettings)
			authProtected.DELETE("/account", authHandler.DeleteAccount)
		}

		// Person routes
		persons := api.Group("/persons")
		persons.Use(middleware.OptionalAuth(cfg.JWTSecret))
		{
			persons.GET("/search", personHandler.SearchPersons)
			persons.GET("/:id", personHandler.GetPerson)
			persons.GET("/:id/children", personHandler.GetChildren)
		}

		personsAuth := api.Group("/persons")
		personsAuth.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			personsAuth.POST("", personHandler.CreatePerson)
			personsAuth.PUT("/:id", personHandler.UpdatePerson)
			personsAuth.DELETE("/:id", personHandler.DeletePerson)
		}

		// Tree routes
		tree := api.Group("/tree")
		tree.Use(middleware.OptionalAuth(cfg.JWTSecret))
		{
			tree.GET("", treeHandler.GetFullTree)
			tree.GET("/:id", treeHandler.GetTree)
			tree.GET("/path/:from/:to", treeHandler.FindPath)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		admin.Use(middleware.RoleMiddleware("admin", "staff"))
		{
			admin.GET("/pending", adminHandler.GetPending)
			admin.PUT("/publish/:id", adminHandler.Publish)
			admin.POST("/backup", adminHandler.CreateBackup)
			admin.GET("/backups", adminHandler.ListBackups)
			admin.POST("/restore/:name", adminHandler.Restore)
		}
	}

	port := cfg.ServerPort
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func runMigrations(db *sqlx.DB) error {
	migrationFile := "migrations/001_init.sql"
	content, err := os.ReadFile(migrationFile)
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}

	_, err = db.Exec(string(content))
	if err != nil {
		// Tables might already exist, that's ok
		log.Printf("Migration note: %v", err)
	}

	log.Println("Migrations applied successfully")
	return nil
}
