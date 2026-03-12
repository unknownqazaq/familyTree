package handlers

// Request/response DTOs for the HTTP transport layer.
// These carry Gin binding tags and should NOT live in the domain models package.

type CreatePersonRequest struct {
	Name        string  `json:"name" binding:"required"`
	ParentID    *int    `json:"parent_id"`
	Reference   *string `json:"reference"`
	Designation *string `json:"designation"`
	History     *string `json:"history"`
	Access      string  `json:"access"`
}

type UpdatePersonRequest struct {
	Name        *string `json:"name"`
	ParentID    *int    `json:"parent_id"`
	Reference   *string `json:"reference"`
	Designation *string `json:"designation"`
	History     *string `json:"history"`
	Access      *string `json:"access"`
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

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}