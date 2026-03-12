# Family Tree / Shejire

Веб-платформа для построения и визуализации генеалогических деревьев. Поддерживает совместное редактирование, модерацию, импорт/экспорт через Excel и мультиязычный интерфейс (KZ/RU/EN).

## Tech Stack

- **Backend:** Go 1.22, Gin, sqlx, PostgreSQL 16, JWT
- **Frontend:** Vue 3, Pinia, Vue Router, d3-hierarchy, vue-i18n, Vite
- **Infra:** Docker, Nginx, Fly.io / Render

## Quick Start (Docker)

```bash
cp .env.example .env        # настрой переменные
docker-compose up --build   # запускает PostgreSQL, backend, frontend, nginx
```

Приложение будет доступно на `http://localhost`.

## Local Development (без Docker)

### Prerequisites

- Go 1.22+
- Node.js 18+
- PostgreSQL 16

### Backend

```bash
cd backend
cp ../.env.example ../.env   # настрой DB-креды под локальный Postgres
go mod download
go run ./cmd/server
```

Backend стартует на `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend стартует на `http://localhost:5173` с прокси на backend.

### Database

Создай базу вручную или используй Docker только для PostgreSQL:

```bash
docker-compose up db         # только PostgreSQL на порту 5432
```

Миграции применяются автоматически при старте backend.

## Makefile

```bash
make dev          # docker-compose up
make backend      # запуск Go-сервера локально
make frontend     # запуск Vite dev-сервера
make test         # все тесты (frontend)
make build        # сборка обоих сервисов
```

## Project Structure

```
backend/
  cmd/server/         — точка входа, роутинг
  internal/
    config/           — загрузка ENV-конфигурации
    models/           — доменные сущности (Person, User)
    repository/       — SQL-запросы (PersonRepo, UserRepo)
    services/         — бизнес-логика (AuthService, PersonService, TreeService)
    handlers/         — HTTP-обработчики + DTO
    middleware/       — JWT-авторизация, CORS
  migrations/         — SQL-миграции

frontend/
  src/
    api/              — Axios-клиент с interceptors
    stores/           — Pinia (auth, tree, search)
    composables/      — Vue composables (layout, gestures, modal)
    components/       — UI-компоненты
    views/            — страницы (TreePage, EditPerson, AdminPanel...)
    i18n/             — переводы KZ/RU/EN
    utils/            — чистые утилиты (treeUtils)
    __tests__/        — Vitest-тесты
```

## API Endpoints

### Auth (public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Получение JWT-токенов |
| POST | `/api/auth/refresh` | Обновление access-токена |

### Auth (protected)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Текущий пользователь |
| PUT | `/api/auth/settings` | Обновление профиля |
| DELETE | `/api/auth/account` | Удаление аккаунта |

### Persons
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/persons/search?q=` | Поиск по имени |
| GET | `/api/persons/:id` | Получить персону |
| GET | `/api/persons/:id/children` | Дети персоны |
| POST | `/api/persons` | Создать (auth) |
| PUT | `/api/persons/:id` | Обновить (auth) |
| DELETE | `/api/persons/:id` | Удалить (auth) |

### Tree
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tree` | Полное дерево |
| GET | `/api/tree/roots` | Корневые узлы |
| GET | `/api/tree/:id` | Поддерево от узла |
| GET | `/api/tree/path/:from/:to` | Путь между двумя узлами |

### Admin (staff+)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/pending` | Персоны на модерации |
| PUT | `/api/admin/publish/:id` | Опубликовать персону |
| POST | `/api/admin/backup` | Создать бэкап |
| GET | `/api/admin/backups` | Список бэкапов |
| POST | `/api/admin/restore/:name` | Восстановить из бэкапа |

## Deployment

См. [DEPLOY.md](DEPLOY.md) для инструкций по Render и Fly.io.

## License

MIT
