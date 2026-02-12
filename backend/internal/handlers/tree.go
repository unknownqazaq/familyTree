package handlers

import (
	"net/http"
	"strconv"

	"family-tree/internal/services"

	"github.com/gin-gonic/gin"
)

type TreeHandler struct {
	treeService *services.TreeService
}

func NewTreeHandler(treeService *services.TreeService) *TreeHandler {
	return &TreeHandler{treeService: treeService}
}

func (h *TreeHandler) GetTree(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userID, _ := c.Get("user_id")
	uid, _ := userID.(int)

	tree, err := h.treeService.GetTree(id, uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tree)
}

func (h *TreeHandler) GetFullTree(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid, _ := userID.(int)

	persons, err := h.treeService.GetFullTree(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get tree"})
		return
	}

	c.JSON(http.StatusOK, persons)
}

func (h *TreeHandler) FindPath(c *gin.Context) {
	fromID, err := strconv.Atoi(c.Param("from"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from id"})
		return
	}

	toID, err := strconv.Atoi(c.Param("to"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to id"})
		return
	}

	path, err := h.treeService.FindPath(fromID, toID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"path": path})
}
