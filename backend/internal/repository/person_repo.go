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
	var count int
	if err := r.db.Get(&count, "SELECT COUNT(*) FROM persons WHERE parent_id = $1", id); err == nil {
		person.HasChildren = count > 0
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
		"SELECT * FROM persons WHERE LOWER(name) LIKE LOWER($1) AND access = 'public' ORDER BY name LIMIT $2",
		"%"+query+"%", limit)
	return persons, err
}

func (r *PersonRepository) SearchForUser(query string, userID int, limit int) ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons,
		`SELECT * FROM persons
		WHERE LOWER(name) LIKE LOWER($1)
		AND (access = 'public' OR created_by = $2
			OR id IN (SELECT person_id FROM person_editors WHERE user_id = $2))
		ORDER BY name LIMIT $3`,
		"%"+query+"%", userID, limit)
	return persons, err
}

// setHasChildren marks which persons in the slice have at least one child,
// using a single batch query. Errors are non-fatal; the field stays false.
func (r *PersonRepository) setHasChildren(persons []models.Person) {
	if len(persons) == 0 {
		return
	}
	ids := make([]int, len(persons))
	for i, p := range persons {
		ids[i] = p.ID
	}
	query, args, err := sqlx.In("SELECT DISTINCT parent_id FROM persons WHERE parent_id IN (?)", ids)
	if err != nil {
		return
	}
	query = r.db.Rebind(query)
	var parentIds []int
	if err := r.db.Select(&parentIds, query, args...); err != nil {
		return
	}
	parentSet := make(map[int]bool, len(parentIds))
	for _, id := range parentIds {
		parentSet[id] = true
	}
	for i := range persons {
		persons[i].HasChildren = parentSet[persons[i].ID]
	}
}

func (r *PersonRepository) GetChildren(parentID int) ([]models.Person, error) {
	children := []models.Person{}
	err := r.db.Select(&children, "SELECT * FROM persons WHERE parent_id = $1 ORDER BY name", parentID)
	if err != nil {
		return nil, err
	}
	r.setHasChildren(children)
	return children, nil
}

func (r *PersonRepository) GetRootsPublic() ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons,
		"SELECT * FROM persons WHERE parent_id IS NULL AND access = 'public' ORDER BY id")
	if err != nil {
		return nil, err
	}
	r.setHasChildren(persons)
	return persons, nil
}

func (r *PersonRepository) GetRootsForUser(userID int) ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons,
		`SELECT * FROM persons
		WHERE parent_id IS NULL
		AND (access = 'public' OR created_by = $1
			OR id IN (SELECT person_id FROM person_editors WHERE user_id = $1))
		ORDER BY id`, userID)
	if err != nil {
		return nil, err
	}
	r.setHasChildren(persons)
	return persons, nil
}

func (r *PersonRepository) GetAllPublic() ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons, "SELECT * FROM persons WHERE access = 'public' ORDER BY id")
	if err != nil {
		return nil, err
	}
	r.setHasChildren(persons)
	return persons, nil
}

func (r *PersonRepository) GetAllForUser(userID int) ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons,
		`SELECT * FROM persons
		WHERE access = 'public' OR created_by = $1
			OR id IN (SELECT person_id FROM person_editors WHERE user_id = $1)
		ORDER BY id`, userID)
	if err != nil {
		return nil, err
	}
	r.setHasChildren(persons)
	return persons, nil
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
		`SELECT COUNT(*) FROM persons
		WHERE id = $1 AND (access = 'public' OR created_by = $2
			OR id IN (SELECT person_id FROM person_editors WHERE user_id = $2))`,
		personID, userID)
	return count > 0, err
}

func (r *PersonRepository) GetAll() ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons, "SELECT * FROM persons ORDER BY id")
	return persons, err
}

func (r *PersonRepository) GetRecent(limit int) ([]models.Person, error) {
	persons := []models.Person{}
	err := r.db.Select(&persons, "SELECT * FROM persons ORDER BY created_at DESC LIMIT $1", limit)
	return persons, err
}
