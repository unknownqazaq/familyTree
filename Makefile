.PHONY: dev backend frontend test build clean db

# Docker — full stack
dev:
	docker-compose up --build

# Docker — only database
db:
	docker-compose up db

# Local backend
backend:
	cd backend && go run ./cmd/server

# Local frontend
frontend:
	cd frontend && npm run dev

# Tests
test:
	cd frontend && npm test

test-watch:
	cd frontend && npm run test:watch

# Build
build:
	cd backend && go build -o ../bin/server ./cmd/server
	cd frontend && npm run build

clean:
	rm -rf bin/ frontend/dist/
