package handlers

import (
	"net/http"
	"strconv"

	"family-tree/internal/middleware"
	"family-tree/internal/models"
	"family-tree/internal/services"

	"github.com/gin-gonic/gin"
)

type PersonHandler struct {
	personService *services.PersonService
}

func NewPersonHandler(personService *services.PersonService) *PersonHandler {
	return &PersonHandler{personService: personService}
}

func (h *PersonHandler) GetPerson(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	person, err := h.personService.Get(id, middleware.GetUserID(c), middleware.GetRole(c))
	if err != nil {
		status := http.StatusNotFound
		if err.Error() == "access denied" {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, person)
}

func (h *PersonHandler) CreatePerson(c *gin.Context) {
	var req CreatePersonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	person, err := h.personService.Create(&models.CreatePersonParams{
		Name:        req.Name,
		ParentID:    req.ParentID,
		Reference:   req.Reference,
		Designation: req.Designation,
		History:     req.History,
		Access:      req.Access,
	}, middleware.GetUserID(c))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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

	var req UpdatePersonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	person, err := h.personService.Update(id, &models.UpdatePersonParams{
		Name:        req.Name,
		ParentID:    req.ParentID,
		Reference:   req.Reference,
		Designation: req.Designation,
		History:     req.History,
		Access:      req.Access,
	}, middleware.GetUserID(c), middleware.GetRole(c))

	if err != nil {
		status := http.StatusInternalServerError
		switch err.Error() {
		case "person not found":
			status = http.StatusNotFound
		case "not authorized to edit this person":
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
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

	if err := h.personService.Delete(id, middleware.GetUserID(c), middleware.GetRole(c)); err != nil {
		status := http.StatusInternalServerError
		switch err.Error() {
		case "person not found":
			status = http.StatusNotFound
		case "not authorized to delete this person":
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
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

	persons, err := h.personService.Search(query, middleware.GetUserID(c), 10)
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

	children, err := h.personService.GetChildren(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get children"})
		return
	}

	c.JSON(http.StatusOK, children)
}
