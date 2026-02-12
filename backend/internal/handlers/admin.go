package handlers

import (
	"net/http"
	"strconv"

	"family-tree/internal/repository"
	"family-tree/internal/services"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	personRepo    *repository.PersonRepository
	backupService *services.BackupService
}

func NewAdminHandler(personRepo *repository.PersonRepository, backupService *services.BackupService) *AdminHandler {
	return &AdminHandler{
		personRepo:    personRepo,
		backupService: backupService,
	}
}

func (h *AdminHandler) GetPending(c *gin.Context) {
	persons, err := h.personRepo.GetPending()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get pending persons"})
		return
	}

	c.JSON(http.StatusOK, persons)
}

func (h *AdminHandler) Publish(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.personRepo.Publish(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to publish person"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "person published"})
}

func (h *AdminHandler) CreateBackup(c *gin.Context) {
	backup, err := h.backupService.CreateBackup()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, backup)
}

func (h *AdminHandler) ListBackups(c *gin.Context) {
	backups, err := h.backupService.ListBackups()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, backups)
}

func (h *AdminHandler) Restore(c *gin.Context) {
	filename := c.Param("name")
	if filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "backup name required"})
		return
	}

	if err := h.backupService.Restore(filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "database restored from backup"})
}
