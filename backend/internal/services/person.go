package services

import (
	"errors"

	"family-tree/internal/models"
)

// PersonRepository defines the data-access contract for the Person aggregate.
type PersonRepository interface {
	Create(person *models.Person) error
	GetByID(id int) (*models.Person, error)
	Update(person *models.Person) error
	Delete(id int) error
	Search(query string, limit int) ([]models.Person, error)
	SearchForUser(query string, userID int, limit int) ([]models.Person, error)
	GetChildren(parentID int) ([]models.Person, error)
	GetRootsPublic() ([]models.Person, error)
	GetRootsForUser(userID int) ([]models.Person, error)
	GetAllPublic() ([]models.Person, error)
	GetAllForUser(userID int) ([]models.Person, error)
	GetAll() ([]models.Person, error)
	GetPending() ([]models.Person, error)
	GetRecent(limit int) ([]models.Person, error)
	Publish(id int) error
	IsEditor(personID, userID int) (bool, error)
	CanAccess(personID, userID int) (bool, error)
}

// UserRepository defines the data-access contract for the User aggregate.
type UserRepository interface {
	Create(user *models.User) error
	GetByEmail(email string) (*models.User, error)
	GetByID(id int) (*models.User, error)
	Update(user *models.User) error
	Delete(id int) error
}

// PersonService encapsulates business logic for person CRUD with access control.
type PersonService struct {
	repo PersonRepository
}

func NewPersonService(repo PersonRepository) *PersonService {
	return &PersonService{repo: repo}
}

const (
	AccessPublic  = "public"
	AccessPrivate = "private"
)

// Get retrieves a person, enforcing access control.
func (s *PersonService) Get(id, userID int, role string) (*models.Person, error) {
	person, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("person not found")
	}

	if person.Access != AccessPublic {
		if userID == 0 {
			return nil, errors.New("access denied")
		}
		canAccess, _ := s.repo.CanAccess(person.ID, userID)
		if !canAccess && role != "admin" && role != "staff" {
			return nil, errors.New("access denied")
		}
	}

	return person, nil
}

// Create creates a new person owned by the given user.
func (s *PersonService) Create(req *models.CreatePersonParams, userID int) (*models.Person, error) {
	access := AccessPrivate
	if req.Access != "" {
		access = req.Access
	}

	person := &models.Person{
		Name:        req.Name,
		ParentID:    req.ParentID,
		Reference:   req.Reference,
		Designation: req.Designation,
		History:     req.History,
		Access:      access,
		CreatedBy:   &userID,
	}

	if err := s.repo.Create(person); err != nil {
		return nil, errors.New("failed to create person")
	}

	return person, nil
}

// Update applies a partial update, enforcing ownership/editor checks.
func (s *PersonService) Update(id int, req *models.UpdatePersonParams, userID int, role string) (*models.Person, error) {
	person, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("person not found")
	}

	if !s.canEdit(person, userID, role) {
		return nil, errors.New("not authorized to edit this person")
	}

	if req.Name != nil {
		person.Name = *req.Name
	}
	if req.ParentID != nil {
		person.ParentID = req.ParentID
	}
	if req.Reference != nil {
		person.Reference = req.Reference
	}
	if req.Designation != nil {
		person.Designation = req.Designation
	}
	if req.History != nil {
		person.History = req.History
	}
	if req.Access != nil {
		person.Access = *req.Access
	}

	if err := s.repo.Update(person); err != nil {
		return nil, errors.New("failed to update person")
	}

	return person, nil
}

// Delete removes a person, enforcing ownership check.
func (s *PersonService) Delete(id, userID int, role string) error {
	person, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("person not found")
	}

	if person.CreatedBy == nil || (*person.CreatedBy != userID && role != "admin") {
		return errors.New("not authorized to delete this person")
	}

	if err := s.repo.Delete(id); err != nil {
		return errors.New("failed to delete person")
	}

	return nil
}

// Search finds persons matching a query, respecting access control.
func (s *PersonService) Search(query string, userID int, limit int) ([]models.Person, error) {
	if userID > 0 {
		return s.repo.SearchForUser(query, userID, limit)
	}
	return s.repo.Search(query, limit)
}

// GetChildren returns children of a person.
func (s *PersonService) GetChildren(parentID int) ([]models.Person, error) {
	return s.repo.GetChildren(parentID)
}

// GetPending returns persons awaiting moderation.
func (s *PersonService) GetPending() ([]models.Person, error) {
	return s.repo.GetPending()
}

// GetRecent returns the most recently created persons.
func (s *PersonService) GetRecent(limit int) ([]models.Person, error) {
	if limit <= 0 || limit > 50 {
		limit = 5
	}
	return s.repo.GetRecent(limit)
}

// Publish makes a person public.
func (s *PersonService) Publish(id int) error {
	return s.repo.Publish(id)
}

func (s *PersonService) canEdit(person *models.Person, userID int, role string) bool {
	if role == "admin" || role == "staff" {
		return true
	}
	if person.CreatedBy != nil && *person.CreatedBy == userID {
		return true
	}
	isEditor, _ := s.repo.IsEditor(person.ID, userID)
	return isEditor
}
