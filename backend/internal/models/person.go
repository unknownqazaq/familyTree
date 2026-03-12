package models

import "time"

type Person struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	ParentID    *int      `json:"parent_id" db:"parent_id"`
	Reference   *string   `json:"reference" db:"reference"`
	Designation *string   `json:"designation" db:"designation"`
	History     *string   `json:"history" db:"history"`
	Access      string    `json:"access" db:"access"`
	CreatedBy   *int      `json:"created_by" db:"created_by"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	// Computed field — not stored in DB; set by specific repo queries.
	HasChildren bool `json:"has_children" db:"-"`
}

// CreatePersonParams holds the data needed to create a person (transport-agnostic).
type CreatePersonParams struct {
	Name        string
	ParentID    *int
	Reference   *string
	Designation *string
	History     *string
	Access      string
}

// UpdatePersonParams holds the data for a partial person update (transport-agnostic).
type UpdatePersonParams struct {
	Name        *string
	ParentID    *int
	Reference   *string
	Designation *string
	History     *string
	Access      *string
}

type TreeNode struct {
	ID       int         `json:"id"`
	Name     string      `json:"name"`
	ParentID *int        `json:"parent_id"`
	Children []*TreeNode `json:"children"`
}

type PathNode struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
