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

// TokenResponse holds JWT access and refresh tokens.
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

// UpdateProfileParams holds the data for a partial user profile update (transport-agnostic).
type UpdateProfileParams struct {
	FirstName       *string
	FatherName      *string
	GrandfatherName *string
	LastName        *string
	BirthDate       *string
	BirthPlace      *string
}
