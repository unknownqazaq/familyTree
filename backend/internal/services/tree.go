package services

import (
	"errors"

	"family-tree/internal/models"
	"family-tree/internal/repository"
)

type TreeService struct {
	personRepo *repository.PersonRepository
}

func NewTreeService(personRepo *repository.PersonRepository) *TreeService {
	return &TreeService{personRepo: personRepo}
}

func (s *TreeService) GetTree(rootID int, userID int) (*models.TreeNode, error) {
	root, err := s.personRepo.GetByID(rootID)
	if err != nil {
		return nil, errors.New("person not found")
	}

	// Fetch all accessible persons once to avoid N+1 queries
	var allPersons []models.Person
	if userID > 0 {
		allPersons, err = s.personRepo.GetAllForUser(userID)
	} else {
		allPersons, err = s.personRepo.GetAllPublic()
	}
	if err != nil {
		return nil, err
	}

	// Build parent-to-children map
	childrenMap := make(map[int][]models.Person)
	for _, person := range allPersons {
		if person.ParentID != nil {
			childrenMap[*person.ParentID] = append(childrenMap[*person.ParentID], person)
		}
	}

	node := &models.TreeNode{
		ID:       root.ID,
		Name:     root.Name,
		ParentID: root.ParentID,
	}

	s.buildTreeOptimized(node, 3, childrenMap)
	return node, nil
}

func (s *TreeService) buildTreeOptimized(node *models.TreeNode, depth int, childrenMap map[int][]models.Person) {
	if depth <= 0 {
		return
	}

	children := childrenMap[node.ID]
	for _, child := range children {
		childNode := &models.TreeNode{
			ID:       child.ID,
			Name:     child.Name,
			ParentID: child.ParentID,
		}
		s.buildTreeOptimized(childNode, depth-1, childrenMap)
		node.Children = append(node.Children, childNode)
	}
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

	// BFS using efficient queue implementation
	visited := make(map[int]bool)
	parent := make(map[int]int)
	queue := []int{fromID}
	visited[fromID] = true
	parent[fromID] = -1
	queueHead := 0

	found := false
	for queueHead < len(queue) {
		current := queue[queueHead]
		queueHead++

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
