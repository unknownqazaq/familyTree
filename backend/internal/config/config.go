package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBDSN      string

	JWTSecret       string
	JWTExpiry       time.Duration
	JWTRefreshExpiry time.Duration

	ServerPort string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	jwtExpiry, err := time.ParseDuration(getEnv("JWT_EXPIRY", "24h"))
	if err != nil {
		jwtExpiry = 24 * time.Hour
	}

	jwtRefreshExpiry, err := time.ParseDuration(getEnv("JWT_REFRESH_EXPIRY", "168h"))
	if err != nil {
		jwtRefreshExpiry = 168 * time.Hour
	}

	cfg := &Config{
		DBHost:          getEnv("POSTGRES_HOST", "localhost"),
		DBPort:          getEnv("POSTGRES_PORT", "5432"),
		DBUser:          getEnv("POSTGRES_USER", "familytree"),
		DBPassword:      getEnv("POSTGRES_PASSWORD", "familytree_secret_2024"),
		DBName:          getEnv("POSTGRES_DB", "familytree"),
		JWTSecret:       getEnv("JWT_SECRET", "default-secret-change-me"),
		JWTExpiry:       jwtExpiry,
		JWTRefreshExpiry: jwtRefreshExpiry,
		ServerPort:      getEnv("SERVER_PORT", "8080"),
	}

	cfg.DBDSN = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
