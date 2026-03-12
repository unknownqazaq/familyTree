package services

import (
	"errors"
	"time"

	"family-tree/internal/config"
	"family-tree/internal/middleware"
	"family-tree/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

func (s *AuthService) Register(email, password, firstName, lastName string) (*models.User, error) {
	existing, _ := s.userRepo.GetByEmail(email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:        email,
		PasswordHash: string(hash),
		FirstName:    &firstName,
		LastName:     &lastName,
		Role:         "user",
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Login(email, password string) (*models.TokenResponse, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return s.generateTokens(user)
}

func (s *AuthService) RefreshToken(refreshToken string) (*models.TokenResponse, error) {
	tc := middleware.ParseToken(refreshToken, s.cfg.JWTSecret)
	if tc == nil {
		return nil, errors.New("invalid refresh token")
	}
	if tc.Type != "refresh" {
		return nil, errors.New("invalid token type")
	}

	user, err := s.userRepo.GetByID(tc.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return s.generateTokens(user)
}

func (s *AuthService) GetUser(id int) (*models.User, error) {
	return s.userRepo.GetByID(id)
}

func (s *AuthService) UpdateProfile(id int, req *models.UpdateProfileParams) error {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return err
	}

	if req.FirstName != nil {
		user.FirstName = req.FirstName
	}
	if req.FatherName != nil {
		user.FatherName = req.FatherName
	}
	if req.GrandfatherName != nil {
		user.GrandfatherName = req.GrandfatherName
	}
	if req.LastName != nil {
		user.LastName = req.LastName
	}
	if req.BirthDate != nil {
		user.BirthDate = req.BirthDate
	}
	if req.BirthPlace != nil {
		user.BirthPlace = req.BirthPlace
	}

	return s.userRepo.Update(user)
}

func (s *AuthService) DeleteAccount(id int) error {
	return s.userRepo.Delete(id)
}

func (s *AuthService) generateTokens(user *models.User) (*models.TokenResponse, error) {
	now := time.Now()

	accessClaims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"type":    "access",
		"exp":     now.Add(s.cfg.JWTExpiry).Unix(),
		"iat":     now.Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	refreshClaims := jwt.MapClaims{
		"user_id": user.ID,
		"type":    "refresh",
		"exp":     now.Add(s.cfg.JWTRefreshExpiry).Unix(),
		"iat":     now.Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshToken.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &models.TokenResponse{
		AccessToken:  accessStr,
		RefreshToken: refreshStr,
		ExpiresIn:    int64(s.cfg.JWTExpiry.Seconds()),
	}, nil
}
