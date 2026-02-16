# Deploy: Render или Fly.io

## Что уже настроено
- Фронтенд читает API URL из `VITE_API_URL` (по умолчанию `/api`): `frontend/src/api/index.js`.
- Бэкенд читает порт из `PORT` (если нет, из `SERVER_PORT`) и SSL mode БД из `DB_SSLMODE`: `backend/internal/config/config.go`.
- Для Docker-сборки фронтенда добавлен build arg `VITE_API_URL`: `frontend/Dockerfile`.

## Render
1. Подключи репозиторий в Render.
2. Выбери Blueprint deploy из `render.yaml`.
3. После создания сервисов обнови:
   - `VITE_API_URL` у `familytree-frontend` на реальный URL бэкенда, например `https://familytree-backend.onrender.com/api`.
4. Перезапусти сборку фронтенда.

Файл: `render.yaml`.

## Fly.io
1. Создай Postgres (например через `fly postgres create`) и получи параметры подключения.
2. Деплой бэкенда:
   - `cd backend`
   - `fly launch --no-deploy --copy-config --config fly.toml`
   - `fly secrets set POSTGRES_HOST=... POSTGRES_PORT=... POSTGRES_USER=... POSTGRES_PASSWORD=... POSTGRES_DB=... JWT_SECRET=...`
   - `fly deploy --config fly.toml`
3. Обнови `frontend/fly.toml`:
   - `VITE_API_URL = "https://<backend-app>.fly.dev/api"`
4. Деплой фронтенда:
   - `cd frontend`
   - `fly launch --no-deploy --copy-config --config fly.toml`
   - `fly deploy --config fly.toml`

Файлы: `backend/fly.toml`, `frontend/fly.toml`.
