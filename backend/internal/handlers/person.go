package handlers

import (
	"net/http"
	"strconv"

	"family-tree/internal/models"
	"family-tree/internal/repository"

	"github.com/gin-gonic/gin"
)

type PersonHandler struct {
	personRepo *repository.PersonRepository
}

func NewPersonHandler(personRepo *repository.PersonRepository) *PersonHandler {
	return &PersonHandler{personRepo: personRepo}
}

func (h *PersonHandler) GetPerson(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	person, err := h.personRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "person not found"})
		return
	}

	userID, _ := c.Get("user_id")
	uid, _ := userID.(int)

	if person.Access != "public" {
		if uid == 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
			return
		}
		role, _ := c.Get("role")
		isRecordOwner := person.CreatedBy != nil && *person.CreatedBy == uid
		if !isRecordOwner && role != "admin" && role != "staff" {
			canAccess, _ := h.personRepo.CanAccess(person.ID, uid)
			if !canAccess {
				c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, person)
}

func (h *PersonHandler) CreatePerson(c *gin.Context) {
	var req models.CreatePersonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	uid := userID.(int)

	access := "private"
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
		CreatedBy:   &uid,
	}

	if err := h.personRepo.Create(person); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create person"})
		return
	}

	c.JSON(http.StatusCreated, person)
}

func (h *PersonHandler) UpdatePerson(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	person, err := h.personRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "person not found"})
		return
	}

	userID, _ := c.Get("user_id")
	uid := userID.(int)
	role, _ := c.Get("role")

	isEditor, _ := h.personRepo.IsEditor(id, uid)
	if person.CreatedBy == nil || (*person.CreatedBy != uid && !isEditor && role != "admin" && role != "staff") {
		c.JSON(http.StatusForbidden, gin.H{"error": "not authorized to edit this person"})
		return
	}

	var req models.UpdatePersonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
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

	if err := h.personRepo.Update(person); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update person"})
		return
	}

	c.JSON(http.StatusOK, person)
}

func (h *PersonHandler) DeletePerson(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	person, err := h.personRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "person not found"})
		return
	}

	userID, _ := c.Get("user_id")
	uid := userID.(int)
	role, _ := c.Get("role")

	if person.CreatedBy == nil || (*person.CreatedBy != uid && role != "admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "not authorized to delete this person"})
		return
	}

	if err := h.personRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete person"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "person deleted"})
}

func (h *PersonHandler) SearchPersons(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search query required"})
		return
	}

	userID, _ := c.Get("user_id")
	uid, _ := userID.(int)

	var persons []models.Person
	var err error

	if uid > 0 {
		persons, err = h.personRepo.SearchForUser(query, uid, 10)
	} else {
		persons, err = h.personRepo.Search(query, 10)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}

	c.JSON(http.StatusOK, persons)
}

func (h *PersonHandler) GetChildren(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	children, err := h.personRepo.GetChildren(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get children"})
		return
	}

	c.JSON(http.StatusOK, children)
}
