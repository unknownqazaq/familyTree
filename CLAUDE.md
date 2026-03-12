# CLAUDE.md — Architecture Guide

## Architecture

Clean Architecture with 3 layers:

```
Handlers (HTTP) → Services (business logic) → Repository (database)
```

- **Handlers** parse HTTP requests, call services, format responses. DTOs live in `handlers/dto.go`.
- **Services** contain business logic and authorization. Depend on repository **interfaces**, not concrete implementations.
- **Repository** executes SQL via sqlx. Concrete structs implement service-defined interfaces.
- **Models** are domain entities (`Person`, `User`) and transport-agnostic params (`CreatePersonParams`).
- **Middleware** handles JWT parsing (`jwt.go`), auth enforcement (`auth.go`), CORS.

## Key Patterns

### Adding a new backend endpoint

1. Add DTO to `handlers/dto.go` (if new request/response shape needed)
2. Add domain params to `models/` (if service needs transport-agnostic input)
3. Add repository method + update interface in `services/person.go` or `services/auth.go`
4. Add service method with business logic
5. Add handler method — parse request, call service, return JSON
6. Register route in `cmd/server/main.go`

### Adding a new frontend page

1. Create view in `src/views/`
2. Add route in `src/router/index.js` (lazy import)
3. Use existing stores (`useTreeStore`, `useAuthStore`) or create new Pinia store
4. Add i18n keys to `src/i18n/locales/` (kk, ru, en)

### Access control model

- Persons have `access`: `"public"` (visible to all) or `"private"` (visible to creator/editors/staff/admin)
- Users have `role`: `"user"`, `"staff"`, `"admin"`
- `OptionalAuth` middleware: sets `user_id=0` for anonymous users so public data is still served
- `AuthMiddleware`: requires valid JWT, rejects anonymous
- `RoleMiddleware`: requires specific role(s)

### JWT flow

- Login → access token (15m) + refresh token (7d)
- Frontend interceptor: on 401, tries refresh, retries original request
- `middleware/jwt.go` contains shared `ParseToken()` used by auth middleware and refresh service

## Commands

```bash
make dev          # docker-compose up (full stack)
make backend      # go run locally
make frontend     # vite dev server
make test         # vitest
make build        # production build
```

## Database

PostgreSQL 16. Schema in `backend/migrations/001_init.sql`. Tables:
- `users` — accounts with email/password/role
- `persons` — tree nodes with name, parent_id (self-ref), access control
- `person_editors` — many-to-many: which users can edit which persons

Migrations run automatically on backend startup.

## Testing

Frontend only (Vitest + happy-dom):
```bash
cd frontend && npm test
```

Tests in `frontend/src/__tests__/`. Test composables and tree logic, not components directly.

## Tech Stack

- **Go 1.22** — Gin, sqlx, golang-jwt, bcrypt
- **Vue 3** — Pinia, Vue Router, d3-hierarchy, vue-i18n
- **PostgreSQL 16**
- **Vite 5** — dev server with API proxy to `:8080`
