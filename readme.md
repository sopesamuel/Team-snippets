# TeamSnippet

A code snippet sharing app for dev teams. Create, view, and share snippets with your teammates.

---

## Stack

**Backend** — Go, MySQL, session-based auth
**Frontend** — React, TypeScript, Vite, Tailwind CSS

---

## Features

- Signup / Login / Logout
- Create code snippets with expiry (1 day, 1 week, 1 year)
- View all latest snippets (team feed)
- Share snippets with specific teammates
- View snippets shared with you
- Session-based authentication with secure cookies

---

## Project Structure

```
Team-Snippet/
├── backend/
│   ├── cmd/web/
│   │   ├── main.go          # Entry point, server config
│   │   ├── routes.go        # All routes
│   │   ├── handlers.go      # Request handlers
│   │   ├── middleware.go    # CORS, auth, logging, recovery
│   │   ├── helpers.go       # JSON response helpers
│   │   └── context.go       # Context keys
│   └── internal/
│       ├── models/          # DB models (snippets, users, shares)
│       └── validator/       # Form validation
└── frontend/
    └── src/
        ├── api/             # API client
        ├── context/         # Auth context
        ├── components/      # Shared components (Layout, Navbar)
        └── pages/           # Login, Signup, Dashboard, Create, View
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Latest snippets (team feed) |
| GET | `/snippet/view/:id` | No | View a single snippet |
| POST | `/snippet/create` | Yes | Create a snippet |
| POST | `/snippet/share` | Yes | Share a snippet with a user |
| GET | `/snippet/shared` | Yes | Snippets shared with me |
| POST | `/user/signup` | No | Register |
| POST | `/user/login` | No | Login |
| POST | `/user/logout` | Yes | Logout |
| GET | `/account/view` | Yes | Current user info |
| GET | `/users` | Yes | List all users |
| POST | `/account/password/update` | Yes | Change password |

---

## Local Development

### Prerequisites

- Go 1.21+
- Node 18+
- Docker (for MySQL)

### Backend

**1. Start MySQL with Docker:**
```bash
docker run --name snippetbox -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=snippetbox -e MYSQL_USER=web -e MYSQL_PASSWORD=pass -p 3306:3306 -d mysql:8
```

**2. Run the backend:**
```bash
cd backend
go run ./cmd/web -cookie-secure=false -cors-origin=http://localhost:5173
```

Backend runs on `http://localhost:4000`

### Frontend

**1. Install dependencies:**
```bash
cd frontend
npm install
```

**2. Create `.env`:**
```
VITE_API_URL=http://localhost:4000
```

**3. Start the dev server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Deployment

### Backend — Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a MySQL database service
3. Deploy the backend from your GitHub repo
4. Set environment variables:
   - `DSN` — your Railway MySQL connection string
   - `CORS_ORIGIN` — your Vercel frontend URL

### Frontend — Vercel

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set the root directory to `frontend`
3. Set environment variables:
   - `VITE_API_URL` — your Railway backend URL

---

## Environment Variables

### Backend flags

| Flag | Default | Description |
|------|---------|-------------|
| `-addr` | `:4000` | Server port |
| `-dsn` | `web:pass@tcp(localhost:3306)/snippetbox` | MySQL DSN |
| `-cors-origin` | `http://localhost:5173` | Allowed CORS origin |
| `-cookie-secure` | `true` | Secure cookie flag (set false for local HTTP) |
| `-debug` | `false` | Debug mode |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |