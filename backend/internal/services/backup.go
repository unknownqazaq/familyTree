package services

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"family-tree/internal/config"
)

type BackupService struct {
	cfg *config.Config
}

type BackupInfo struct {
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	CreatedAt string `json:"created_at"`
}

func NewBackupService(cfg *config.Config) *BackupService {
	return &BackupService{cfg: cfg}
}

func (s *BackupService) CreateBackup() (*BackupInfo, error) {
	if err := os.MkdirAll(s.cfg.BackupDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create backup directory: %w", err)
	}

	timestamp := time.Now().Format("2006-01-02_15-04-05")
	filename := fmt.Sprintf("backup_%s.sql", timestamp)
	dest := filepath.Join(s.cfg.BackupDir, filename)

	cmd := exec.Command("pg_dump",
		"-h", s.cfg.DBHost,
		"-p", s.cfg.DBPort,
		"-U", s.cfg.DBUser,
		"-d", s.cfg.DBName,
		"-f", dest,
	)
	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", s.cfg.DBPassword))

	if output, err := cmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("pg_dump failed: %s, %w", string(output), err)
	}

	info, err := os.Stat(dest)
	if err != nil {
		return nil, err
	}

	return &BackupInfo{
		Name:      filename,
		Size:      info.Size(),
		CreatedAt: timestamp,
	}, nil
}

func (s *BackupService) ListBackups() ([]BackupInfo, error) {
	entries, err := os.ReadDir(s.cfg.BackupDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []BackupInfo{}, nil
		}
		return nil, err
	}

	var backups []BackupInfo
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		backups = append(backups, BackupInfo{
			Name:      entry.Name(),
			Size:      info.Size(),
			CreatedAt: info.ModTime().Format("2006-01-02 15:04:05"),
		})
	}

	sort.Slice(backups, func(i, j int) bool {
		return backups[i].CreatedAt > backups[j].CreatedAt
	})

	return backups, nil
}

func (s *BackupService) Restore(filename string) error {
	// Prevent path traversal
	clean := filepath.Base(filename)
	if clean != filename {
		return fmt.Errorf("invalid backup filename: %s", filename)
	}

	dest := filepath.Join(s.cfg.BackupDir, clean)

	if _, err := os.Stat(dest); os.IsNotExist(err) {
		return fmt.Errorf("backup file not found: %s", filename)
	}

	cmd := exec.Command("psql",
		"-h", s.cfg.DBHost,
		"-p", s.cfg.DBPort,
		"-U", s.cfg.DBUser,
		"-d", s.cfg.DBName,
		"-f", dest,
	)
	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", s.cfg.DBPassword))

	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("restore failed: %s, %w", string(output), err)
	}

	return nil
}
