package services

import (
	"errors"

	"family-tree/internal/models"
)

type TreeService struct {
	personRepo PersonRepository
}

func NewTreeService(personRepo PersonRepository) *TreeService {
	return &TreeService{personRepo: personRepo}
}

func (s *TreeService) GetTree(rootID int, userID int) (*models.TreeNode, error) {
	root, err := s.personRepo.GetByID(rootID)
	if err != nil {
		return nil, errors.New("person not found")
	}

	node := &models.TreeNode{
		ID:       root.ID,
		Name:     root.Name,
		ParentID: root.ParentID,
	}

	s.buildTree(node, 3, userID)
	return node, nil
}

func (s *TreeService) buildTree(node *models.TreeNode, depth int, userID int) {
	if depth <= 0 {
		return
	}

	children, err := s.personRepo.GetChildren(node.ID)
	if err != nil {
		return
	}

	for _, child := range children {
		if child.Access == "public" || (child.CreatedBy != nil && *child.CreatedBy == userID) {
			childNode := &models.TreeNode{
				ID:       child.ID,
				Name:     child.Name,
				ParentID: child.ParentID,
			}
			s.buildTree(childNode, depth-1, userID)
			node.Children = append(node.Children, childNode)
		}
	}
}

func (s *TreeService) GetRoots(userID int) ([]models.Person, error) {
	if userID > 0 {
		return s.personRepo.GetRootsForUser(userID)
	}
	return s.personRepo.GetRootsPublic()
}

func (s *TreeService) GetFullTree(userID int) ([]models.Person, error) {
	if userID > 0 {
		return s.personRepo.GetAllForUser(userID)
	}
	return s.personRepo.GetAllPublic()
}

func (s *TreeService) FindPath(fromID, toID int) ([]models.PathNode, error) {
	allPersons, err := s.personRepo.GetAll()
	if err != nil {
		return nil, err
	}

	personMap := make(map[int]*models.Person)
	for i := range allPersons {
		personMap[allPersons[i].ID] = &allPersons[i]
	}

	if _, ok := personMap[fromID]; !ok {
		return nil, errors.New("source person not found")
	}
	if _, ok := personMap[toID]; !ok {
		return nil, errors.New("target person not found")
	}

	// Build adjacency list (parent-child connections are bidirectional for path finding)
	adj := make(map[int][]int)
	for _, p := range allPersons {
		if p.ParentID != nil {
			adj[p.ID] = append(adj[p.ID], *p.ParentID)
			adj[*p.ParentID] = append(adj[*p.ParentID], p.ID)
		}
	}

	// BFS
	visited := make(map[int]bool)
	parent := make(map[int]int)
	queue := []int{fromID}
	visited[fromID] = true
	parent[fromID] = -1

	found := false
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		if current == toID {
			found = true
			break
		}

		for _, neighbor := range adj[current] {
			if !visited[neighbor] {
				visited[neighbor] = true
				parent[neighbor] = current
				queue = append(queue, neighbor)
			}
		}
	}

	if !found {
		return nil, errors.New("no path found between the two persons")
	}

	// Reconstruct path
	var path []models.PathNode
	for current := toID; current != -1; current = parent[current] {
		p := personMap[current]
		path = append([]models.PathNode{{ID: p.ID, Name: p.Name}}, path...)
	}

	return path, nil
}
