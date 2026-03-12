package services

import (
	"testing"

	"family-tree/internal/models"
)

// ─── Mock with tree data ────────────────────────────────────────────────────

type treeTestRepo struct {
	mockPersonRepo
	childrenMap map[int][]models.Person
	allPersons  []models.Person
}

func newTreeTestRepo() *treeTestRepo {
	uid := 1
	otherUID := 2
	parentID1 := 1
	parentID2 := 2

	alice := models.Person{ID: 1, Name: "Alice", Access: "public", CreatedBy: &uid}
	bob := models.Person{ID: 2, Name: "Bob", ParentID: &parentID1, Access: "public", CreatedBy: &uid}
	carol := models.Person{ID: 3, Name: "Carol", ParentID: &parentID2, Access: "private", CreatedBy: &otherUID}
	dave := models.Person{ID: 4, Name: "Dave", ParentID: &parentID1, Access: "public", CreatedBy: &uid}

	repo := &treeTestRepo{
		mockPersonRepo: mockPersonRepo{
			persons: map[int]*models.Person{
				1: &alice, 2: &bob, 3: &carol, 4: &dave,
			},
			editors: make(map[[2]int]bool),
		},
		childrenMap: map[int][]models.Person{
			1: {bob, dave},
			2: {carol},
		},
		allPersons: []models.Person{alice, bob, carol, dave},
	}
	return repo
}

func (r *treeTestRepo) GetChildren(parentID int) ([]models.Person, error) {
	return r.childrenMap[parentID], nil
}

func (r *treeTestRepo) GetAll() ([]models.Person, error) {
	return r.allPersons, nil
}

func (r *treeTestRepo) GetRootsPublic() ([]models.Person, error) {
	var roots []models.Person
	for _, p := range r.allPersons {
		if p.ParentID == nil && p.Access == "public" {
			roots = append(roots, p)
		}
	}
	return roots, nil
}

func (r *treeTestRepo) GetRootsForUser(uid int) ([]models.Person, error) {
	return r.GetRootsPublic()
}

func (r *treeTestRepo) GetAllPublic() ([]models.Person, error) {
	var out []models.Person
	for _, p := range r.allPersons {
		if p.Access == "public" {
			out = append(out, p)
		}
	}
	return out, nil
}

func (r *treeTestRepo) GetAllForUser(uid int) ([]models.Person, error) {
	return r.allPersons, nil
}

// ─── GetTree ─────────────────────────────────────────────────────────────────

func TestGetTree_ReturnsRoot(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	tree, err := svc.GetTree(1, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if tree.Name != "Alice" {
		t.Fatalf("expected Alice, got %s", tree.Name)
	}
}

func TestGetTree_IncludesPublicChildren(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	tree, err := svc.GetTree(1, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Alice has 2 public children: Bob and Dave
	if len(tree.Children) != 2 {
		t.Fatalf("expected 2 children, got %d", len(tree.Children))
	}
}

func TestGetTree_FiltersPrivateChildren(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	// user 1 is not carol's creator (uid=2), so carol should be filtered
	tree, err := svc.GetTree(2, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Bob's child Carol is private and created by user 2, so filtered for user 1
	if len(tree.Children) != 0 {
		t.Fatalf("expected 0 children (private filtered), got %d", len(tree.Children))
	}
}

func TestGetTree_OwnerSeesPrivateChildren(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	tree, err := svc.GetTree(2, 2) // user 2 is carol's creator
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tree.Children) != 1 {
		t.Fatalf("expected 1 child (carol), got %d", len(tree.Children))
	}
	if tree.Children[0].Name != "Carol" {
		t.Fatalf("expected Carol, got %s", tree.Children[0].Name)
	}
}

func TestGetTree_NotFound(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	_, err := svc.GetTree(999, 0)
	if err == nil || err.Error() != "person not found" {
		t.Fatalf("expected not found, got %v", err)
	}
}

// ─── FindPath ────────────────────────────────────────────────────────────────

func TestFindPath_DirectParentChild(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	path, err := svc.FindPath(1, 2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(path) != 2 {
		t.Fatalf("expected path of length 2, got %d", len(path))
	}
	if path[0].Name != "Alice" || path[1].Name != "Bob" {
		t.Fatalf("expected Alice→Bob, got %s→%s", path[0].Name, path[1].Name)
	}
}

func TestFindPath_GrandparentToGrandchild(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	path, err := svc.FindPath(1, 3) // Alice → Bob → Carol
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(path) != 3 {
		t.Fatalf("expected path of length 3, got %d", len(path))
	}
	if path[0].Name != "Alice" || path[1].Name != "Bob" || path[2].Name != "Carol" {
		t.Fatalf("unexpected path: %v", path)
	}
}

func TestFindPath_SiblingToSibling(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	path, err := svc.FindPath(2, 4) // Bob → Alice → Dave
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(path) != 3 {
		t.Fatalf("expected path of length 3, got %d", len(path))
	}
}

func TestFindPath_SourceNotFound(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	_, err := svc.FindPath(999, 1)
	if err == nil || err.Error() != "source person not found" {
		t.Fatalf("expected source not found, got %v", err)
	}
}

func TestFindPath_TargetNotFound(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	_, err := svc.FindPath(1, 999)
	if err == nil || err.Error() != "target person not found" {
		t.Fatalf("expected target not found, got %v", err)
	}
}

func TestFindPath_SameNode(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	path, err := svc.FindPath(1, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(path) != 1 {
		t.Fatalf("expected path of length 1, got %d", len(path))
	}
}

// ─── GetRoots ────────────────────────────────────────────────────────────────

func TestGetRoots_Anonymous(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	roots, err := svc.GetRoots(0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(roots) != 1 || roots[0].Name != "Alice" {
		t.Fatalf("expected [Alice], got %v", roots)
	}
}

func TestGetFullTree_Anonymous(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	persons, err := svc.GetFullTree(0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// only public persons: Alice, Bob, Dave (carol is private)
	if len(persons) != 3 {
		t.Fatalf("expected 3 public persons, got %d", len(persons))
	}
}

func TestGetFullTree_Authenticated(t *testing.T) {
	svc := NewTreeService(newTreeTestRepo())
	persons, err := svc.GetFullTree(1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// all persons including private
	if len(persons) != 4 {
		t.Fatalf("expected 4 persons, got %d", len(persons))
	}
}
