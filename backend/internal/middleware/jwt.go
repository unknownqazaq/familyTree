package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// TokenClaims holds the parsed JWT claims relevant to this application.
type TokenClaims struct {
	UserID int
	Email  string
	Role   string
	Type   string // "access" or "refresh"
}

// ParseToken validates a JWT string and extracts claims.
// Returns nil if parsing fails or the token is invalid.
func ParseToken(tokenStr, secret string) *TokenClaims {
	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return nil
	}

	userIDFloat, _ := (*claims)["user_id"].(float64)
	email, _ := (*claims)["email"].(string)
	role, _ := (*claims)["role"].(string)
	tokenType, _ := (*claims)["type"].(string)

	return &TokenClaims{
		UserID: int(userIDFloat),
		Email:  email,
		Role:   role,
		Type:   tokenType,
	}
}

// SetClaimsToContext stores parsed token claims in the Gin context.
func SetClaimsToContext(c *gin.Context, tc *TokenClaims) {
	c.Set("user_id", tc.UserID)
	c.Set("email", tc.Email)
	c.Set("role", tc.Role)
}

// GetUserID extracts the user ID from the Gin context.
// Returns 0 if not set or not authenticated.
func GetUserID(c *gin.Context) int {
	v, _ := c.Get("user_id")
	uid, _ := v.(int)
	return uid
}

// GetRole extracts the user role from the Gin context.
func GetRole(c *gin.Context) string {
	v, _ := c.Get("role")
	role, _ := v.(string)
	return role
}
