package repository

import (
	"family-tree/internal/models"

	"github.com/jmoiron/sqlx"
)

type PersonRepository struct {
	db *sqlx.DB
}

func NewPersonRepository(db *sqlx.DB) *PersonRepository {
	return &PersonRepository{db: db}
}

func (r *PersonRepository) Create(person *models.Person) error {
	query := `
		INSERT INTO persons (name, parent_id, reference, designation, history, access, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`
	return r.db.QueryRow(query,
		person.Name, person.ParentID, person.Reference,
		person.Designation, person.History, person.Access, person.CreatedBy,
	).Scan(&person.ID, &person.CreatedAt, &person.UpdatedAt)
}

func (r *PersonRepository) GetByID(id int) (*models.Person, error) {
	person := &models.Person{}
	err := r.db.Get(person, "SELECT * FROM persons WHERE id = $1", id)
	if err != nil {
		return nil, err
	}
	return person, nil
}

func (r *PersonRepository) Update(person *models.Person) error {
	query := `
		UPDATE persons SET
			name = $1, parent_id = $2, reference = $3,
			designation = $4, history = $5, access = $6,
			updated_at = NOW()
		WHERE id = $7`
	_, err := r.db.Exec(query,
		person.Name, person.ParentID, person.Reference,
		person.Designation, person.History, person.Access, person.ID)
	return err
}

func (r *PersonRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM persons WHERE id = $1", id)
	return err
}

func (r *PersonRepository) Search(query string, limit int) ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons,
		"SELECT * FROM persons WHERE name ILIKE $1 AND access = 'public' ORDER BY name LIMIT $2",
		"%"+query+"%", limit)
	return persons, err
}

func (r *PersonRepository) SearchForUser(query string, userID int, limit int) ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons,
		`SELECT * FROM persons p
		WHERE p.name ILIKE $1
		AND (p.access = 'public' OR p.created_by = $2
			OR EXISTS (SELECT 1 FROM person_editors pe WHERE pe.person_id = p.id AND pe.user_id = $2))
		ORDER BY p.name LIMIT $3`,
		"%"+query+"%", userID, limit)
	return persons, err
}

func (r *PersonRepository) GetChildren(parentID int) ([]models.Person, error) {
	children := []models.Person{}
	err := r.db.Select(&children, "SELECT * FROM persons WHERE parent_id = $1 ORDER BY name", parentID)
	return children, err
}

func (r *PersonRepository) GetAllPublic() ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons, "SELECT * FROM persons WHERE access = 'public' ORDER BY id")
	return persons, err
}

func (r *PersonRepository) GetAllForUser(userID int) ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons,
		`SELECT * FROM persons p
		WHERE p.access = 'public' OR p.created_by = $1
			OR EXISTS (SELECT 1 FROM person_editors pe WHERE pe.person_id = p.id AND pe.user_id = $1)
		ORDER BY p.id`, userID)
	return persons, err
}

func (r *PersonRepository) GetPending() ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons, "SELECT * FROM persons WHERE access = 'private' ORDER BY created_at DESC")
	return persons, err
}

func (r *PersonRepository) Publish(id int) error {
	_, err := r.db.Exec("UPDATE persons SET access = 'public', updated_at = NOW() WHERE id = $1", id)
	return err
}

func (r *PersonRepository) IsEditor(personID, userID int) (bool, error) {
	var count int
	err := r.db.Get(&count,
		`SELECT COUNT(*) FROM person_editors WHERE person_id = $1 AND user_id = $2`,
		personID, userID)
	return count > 0, err
}

func (r *PersonRepository) CanAccess(personID, userID int) (bool, error) {
	var count int
	err := r.db.Get(&count,
		`SELECT COUNT(*) FROM persons p
		WHERE p.id = $1 AND (p.access = 'public' OR p.created_by = $2
			OR EXISTS (SELECT 1 FROM person_editors pe WHERE pe.person_id = p.id AND pe.user_id = $2))`,
		personID, userID)
	return count > 0, err
}

func (r *PersonRepository) GetAll() ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons, "SELECT * FROM persons ORDER BY id")
	return persons, err
}
