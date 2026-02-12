package models

import "time"

type User struct {
	ID              int        `json:"id" db:"id"`
	Email           string     `json:"email" db:"email"`
	PasswordHash    string     `json:"-" db:"password_hash"`
	FirstName       *string    `json:"first_name" db:"first_name"`
	FatherName      *string    `json:"father_name" db:"father_name"`
	GrandfatherName *string    `json:"grandfather_name" db:"grandfather_name"`
	LastName        *string    `json:"last_name" db:"last_name"`
	BirthDate       *string    `json:"birth_date" db:"birth_date"`
	BirthPlace      *string    `json:"birth_place" db:"birth_place"`
	Role            string     `json:"role" db:"role"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfileRequest struct {
	FirstName       *string `json:"first_name"`
	FatherName      *string `json:"father_name"`
	GrandfatherName *string `json:"grandfather_name"`
	LastName        *string `json:"last_name"`
	BirthDate       *string `json:"birth_date"`
	BirthPlace      *string `json:"birth_place"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}
