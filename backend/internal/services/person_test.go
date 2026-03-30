package services

import (
	"errors"
	"testing"

	"family-tree/internal/models"
)

// ─── Mock ────────────────────────────────────────────────────────────────────

type mockPersonRepo struct {
	persons  map[int]*models.Person
	editors  map[[2]int]bool // [personID, userID] → true
	createFn func(*models.Person) error
}

func newMockRepo() *mockPersonRepo {
	uid := 1
	return &mockPersonRepo{
		persons: map[int]*models.Person{
			1: {ID: 1, Name: "Alice", Access: "public", CreatedBy: &uid},
			2: {ID: 2, Name: "Bob", Access: "private", CreatedBy: &uid},
		},
		editors: make(map[[2]int]bool),
	}
}

func (m *mockPersonRepo) GetByID(id int) (*models.Person, error) {
	p, ok := m.persons[id]
	if !ok {
		return nil, errors.New("not found")
	}
	return p, nil
}

func (m *mockPersonRepo) Create(p *models.Person) error {
	if m.createFn != nil {
		return m.createFn(p)
	}
	p.ID = len(m.persons) + 1
	m.persons[p.ID] = p
	return nil
}

func (m *mockPersonRepo) Update(p *models.Person) error {
	m.persons[p.ID] = p
	return nil
}

func (m *mockPersonRepo) Delete(id int) error {
	delete(m.persons, id)
	return nil
}

func (m *mockPersonRepo) CanAccess(personID, userID int) (bool, error) {
	p, ok := m.persons[personID]
	if !ok {
		return false, nil
	}
	if p.Access == "public" {
		return true, nil
	}
	if p.CreatedBy != nil && *p.CreatedBy == userID {
		return true, nil
	}
	return m.editors[[2]int{personID, userID}], nil
}

func (m *mockPersonRepo) IsEditor(personID, userID int) (bool, error) {
	return m.editors[[2]int{personID, userID}], nil
}

func (m *mockPersonRepo) Search(q string, limit int) ([]models.Person, error)                { return nil, nil }
func (m *mockPersonRepo) SearchForUser(q string, uid int, limit int) ([]models.Person, error) { return nil, nil }
func (m *mockPersonRepo) GetChildren(pid int) ([]models.Person, error)                        { return nil, nil }
func (m *mockPersonRepo) GetRootsPublic() ([]models.Person, error)                            { return nil, nil }
func (m *mockPersonRepo) GetRootsForUser(uid int) ([]models.Person, error)                    { return nil, nil }
func (m *mockPersonRepo) GetAllPublic() ([]models.Person, error)                              { return nil, nil }
func (m *mockPersonRepo) GetAllForUser(uid int) ([]models.Person, error)                      { return nil, nil }
func (m *mockPersonRepo) GetAll() ([]models.Person, error)                                    { return nil, nil }
func (m *mockPersonRepo) GetPending() ([]models.Person, error)                                { return nil, nil }
func (m *mockPersonRepo) GetRecent(limit int) ([]models.Person, error)                        { return nil, nil }
func (m *mockPersonRepo) Publish(id int) error                                                { return nil }

// ─── Get ─────────────────────────────────────────────────────────────────────

func TestGet_PublicPerson_NoAuth(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	p, err := svc.Get(1, 0, "")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if p.Name != "Alice" {
		t.Fatalf("expected Alice, got %s", p.Name)
	}
}

func TestGet_PrivatePerson_NoAuth(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	_, err := svc.Get(2, 0, "")
	if err == nil || err.Error() != "access denied" {
		t.Fatalf("expected access denied, got %v", err)
	}
}

func TestGet_PrivatePerson_Owner(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	p, err := svc.Get(2, 1, "user")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if p.Name != "Bob" {
		t.Fatalf("expected Bob, got %s", p.Name)
	}
}

func TestGet_PrivatePerson_Admin(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	p, err := svc.Get(2, 999, "admin")
	if err != nil {
		t.Fatalf("expected no error for admin, got %v", err)
	}
	if p.Name != "Bob" {
		t.Fatalf("expected Bob, got %s", p.Name)
	}
}

func TestGet_PrivatePerson_UnrelatedUser(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	_, err := svc.Get(2, 999, "user")
	if err == nil || err.Error() != "access denied" {
		t.Fatalf("expected access denied, got %v", err)
	}
}

func TestGet_NotFound(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	_, err := svc.Get(999, 0, "")
	if err == nil || err.Error() != "person not found" {
		t.Fatalf("expected person not found, got %v", err)
	}
}

// ─── Create ──────────────────────────────────────────────────────────────────

func TestCreate_DefaultsToPrivate(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	p, err := svc.Create(&models.CreatePersonParams{Name: "Test"}, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Access != "private" {
		t.Fatalf("expected private, got %s", p.Access)
	}
}

func TestCreate_RespectsExplicitAccess(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	p, err := svc.Create(&models.CreatePersonParams{Name: "Test", Access: "public"}, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Access != "public" {
		t.Fatalf("expected public, got %s", p.Access)
	}
}

func TestCreate_SetsCreatedBy(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	p, err := svc.Create(&models.CreatePersonParams{Name: "Test"}, 42)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.CreatedBy == nil || *p.CreatedBy != 42 {
		t.Fatalf("expected created_by=42, got %v", p.CreatedBy)
	}
}

func TestCreate_RepoError(t *testing.T) {
	repo := newMockRepo()
	repo.createFn = func(p *models.Person) error { return errors.New("db error") }
	svc := NewPersonService(repo)
	_, err := svc.Create(&models.CreatePersonParams{Name: "Test"}, 1)
	if err == nil || err.Error() != "failed to create person" {
		t.Fatalf("expected failure, got %v", err)
	}
}

// ─── Update ──────────────────────────────────────────────────────────────────

func TestUpdate_OwnerCanEdit(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	name := "Updated"
	p, err := svc.Update(1, &models.UpdatePersonParams{Name: &name}, 1, "user")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Name != "Updated" {
		t.Fatalf("expected Updated, got %s", p.Name)
	}
}

func TestUpdate_NonOwnerDenied(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	name := "Hacked"
	_, err := svc.Update(1, &models.UpdatePersonParams{Name: &name}, 999, "user")
	if err == nil || err.Error() != "not authorized to edit this person" {
		t.Fatalf("expected auth error, got %v", err)
	}
}

func TestUpdate_AdminCanEdit(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	name := "AdminEdit"
	p, err := svc.Update(1, &models.UpdatePersonParams{Name: &name}, 999, "admin")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Name != "AdminEdit" {
		t.Fatalf("expected AdminEdit, got %s", p.Name)
	}
}

func TestUpdate_EditorCanEdit(t *testing.T) {
	repo := newMockRepo()
	repo.editors[[2]int{1, 5}] = true
	svc := NewPersonService(repo)
	name := "EditorEdit"
	p, err := svc.Update(1, &models.UpdatePersonParams{Name: &name}, 5, "user")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Name != "EditorEdit" {
		t.Fatalf("expected EditorEdit, got %s", p.Name)
	}
}

func TestUpdate_PartialFields(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	ref := "source"
	p, err := svc.Update(1, &models.UpdatePersonParams{Reference: &ref}, 1, "user")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Reference == nil || *p.Reference != "source" {
		t.Fatalf("expected reference=source, got %v", p.Reference)
	}
	if p.Name != "Alice" {
		t.Fatalf("name should remain Alice, got %s", p.Name)
	}
}

// ─── Delete ──────────────────────────────────────────────────────────────────

func TestDelete_OwnerCanDelete(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	err := svc.Delete(1, 1, "user")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestDelete_NonOwnerDenied(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	err := svc.Delete(1, 999, "user")
	if err == nil || err.Error() != "not authorized to delete this person" {
		t.Fatalf("expected auth error, got %v", err)
	}
}

func TestDelete_AdminCanDelete(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	err := svc.Delete(1, 999, "admin")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestDelete_NotFound(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	err := svc.Delete(999, 1, "user")
	if err == nil || err.Error() != "person not found" {
		t.Fatalf("expected not found, got %v", err)
	}
}

// ─── Search ──────────────────────────────────────────────────────────────────

func TestSearch_AnonymousUsesPublicSearch(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	_, err := svc.Search("test", 0, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestSearch_AuthenticatedUsesUserSearch(t *testing.T) {
	svc := NewPersonService(newMockRepo())
	_, err := svc.Search("test", 1, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
