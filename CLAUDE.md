# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A family tree management web application. Users can create, browse, and search genealogical records organized as a tree (parent-child relationships). Includes role-based access control (user/staff/admin), a moderation workflow (private entries require publishing), and database backup/restore via admin panel.

## Architecture

**Full-stack app deployed with Docker Compose** (4 services):
- **backend** — Go 1.22 REST API using Gin framework, PostgreSQL via sqlx
- **frontend** — Vue 3 SPA with Vite, Pinia stores, vis-network for tree visualization
- **db** — PostgreSQL 16
- **nginx** — Reverse proxy: `/api/` → backend:8080, `/` → frontend:80

### Backend Structure (`backend/`)

Standard Go layout with dependency injection wired in `cmd/server/main.go`:

`repository` → `services` → `handlers` (each handler receives its dependencies via constructor)

- **models/** — Domain types + request/response DTOs (User, Person, TreeNode, PathNode)
- **repository/** — Database access layer (UserRepository, PersonRepository) using sqlx
- **services/** — Business logic: AuthService (JWT auth with bcrypt), TreeService (tree building with BFS path-finding), BackupService (pg_dump/psql wrappers)
- **handlers/** — Gin HTTP handlers for auth, person CRUD, tree queries, admin operations
- **middleware/** — AuthMiddleware (required JWT), OptionalAuth (JWT if present), RoleMiddleware (role check), CORS
- **migrations/** — Single SQL migration file (`001_init.sql`) run on startup

Auth uses HS256 JWT with access + refresh token pattern. Tokens carry `user_id`, `email`, `role`, `type` claims.

### Frontend Structure (`frontend/`)

- **stores/** — Pinia: `auth` (login/register/token management), `tree` (CRUD + search + path-finding)
- **api/** — Axios instance with interceptor for auto-attaching Bearer token and transparent token refresh on 401
- **router/** — Vue Router with `requiresAuth`, `requiresAdmin`, `requiresStaff` route guards
- **components/** — NavBar, SearchBar, PersonCard, PersonForm, TreeView (vis-network), PathView
- **views/** — Home, Login, Register, TreePage, EditPerson, Settings, AdminPanel, ModerationView

### Database Schema

Three tables: `users`, `persons`, `person_editors` (many-to-many for shared editing). Persons form a tree via `parent_id` self-reference. Access control per person: `public` or `private`.

## Build & Run Commands

### Full stack (Docker Compose)
```
docker-compose up --build
```
App available at http://localhost:80. Backend API at http://localhost:8080.

### Backend only (local development)
```
cd backend
go build ./cmd/server
go run ./cmd/server
```
Requires PostgreSQL running and env vars set (see `.env`).

### Frontend only (local development)
```
cd frontend
npm install
npm run dev        # Dev server on :5173, proxies /api to localhost:8080
npm run build      # Production build to dist/
```

## Key API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login (returns tokens) |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/persons/search?q=` | Optional | Search by name |
| GET/POST/PUT/DELETE | `/api/persons[/:id]` | Required for writes | Person CRUD |
| GET | `/api/tree` | Optional | Full tree (public or user-scoped) |
| GET | `/api/tree/:id` | Optional | Subtree from person (depth 3) |
| GET | `/api/tree/path/:from/:to` | Optional | BFS shortest path between two persons |
| GET/PUT/POST | `/api/admin/*` | Admin/Staff | Moderation, backup/restore |

## Environment Variables

Configured via `.env` at project root. Key vars: `POSTGRES_*` (db connection), `JWT_SECRET`, `JWT_EXPIRY`, `JWT_REFRESH_EXPIRY`, `SERVER_PORT`, `VITE_API_URL`.

## Important Patterns

- Person visibility is `public` or `private`. Private entries are only visible to the creator, editors (via `person_editors` table), and admin/staff roles.
- New persons default to `access = "private"` and must be published by admin/staff via `PUT /api/admin/publish/:id`.
- Tree building has a hard-coded depth limit of 3 levels (`services/tree.go:buildTree`).
- Backups are stored in `/app/backups` (mapped to `./backups` on host) as raw SQL dumps.
- The frontend uses `vis-network` for interactive tree graph rendering.
