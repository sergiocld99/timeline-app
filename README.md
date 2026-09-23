# Timeline App

A full-stack application for tracking travels, visits, and locations with interactive maps, statistics, and user management.

## 🚀 Tech Stack

### Backend
- **Node.js** with **Express** (v5) - Main API
- **Java 21** with **Quarkus 3** - Statistics Service
- **MongoDB** with **Mongoose**
- RESTful API architecture

### Frontend
- **Next.js 16** (App Router, Turbopack) with **React 19**
- **TypeScript**
- **Tailwind CSS v4** with **shadcn/ui** components
- **Leaflet** for interactive maps
- **Recharts** for data visualization

### Infrastructure
- **Docker Compose** for containerization
- **MongoDB** database service

## 📁 Project Structure

```
timeline-app/
├── backend/             # Express API server
│   ├── controller/      # Request handlers
│   ├── domain/          # Pure business rules & value objects
│   ├── events/          # In-process event emitter (publisher/subscriber)
│   ├── error/           # Custom error types (BusinessRuleError)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── test/            # Node test runner tests
│
├── statistics-service/  # Quarkus Stats microservice (Java 21)
│   ├── src/             # Source code
│   └── pom.xml          # Maven dependencies
│
├── frontend-v2/         # Next.js application
│   └── src/
│       ├── app/         # Routes under [locale] (Server Components)
│       ├── components/  # React components
│       ├── hooks/       # Custom React hooks
│       ├── services/    # API client services
│       └── contexts/    # React contexts
│
├── e2e/                 # Playwright test suite (runs against the full stack)
├── docs/                # ADRs, software design docs
├── curl-examples/       # Known-good curl one-liners for the API
└── postman/             # Postman collections
```

## 🛠️ Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 22+ (for local backend/frontend/tooling development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd timeline-app
```

2. Create a `.env` file in the root directory from the template:
```bash
cp .env.example .env
```

3. (Optional) Create a `frontend-v2/.env.local` for user defaults:
```env
# Set a default user ID for auto-login (prevents Guest mode)
NEXT_PUBLIC_DEFAULT_USER_ID=1
```

4. Start all services:
```bash
docker compose up --build -d
```

This will start:
- **MongoDB** on port `27017`
- **Backend API** on port `3000`
- **Statistics Service** on port `8081`
- **Frontend** on port `3002`

> **⚠️ Important**: When making changes to the frontend code, always use the `--build` flag to force a rebuild:
> ```bash
> docker compose up --build -d
> ```
> This ensures Next.js recompiles with your latest changes.

5. Open your browser:
```
http://localhost:3002
```

### Local Development

#### Backend
```bash
cd backend
npm install
npm start
```

#### Statistics Service (Quarkus)
```bash
cd statistics-service
./mvnw quarkus:dev
```
The service will run on `http://localhost:8081`.

#### Frontend
```bash
cd frontend-v2
npm install
npm run dev
```
The frontend will run on `http://localhost:3002` (Next.js default).

#### E2E tests (Playwright)
```bash
cd e2e
npm install
npm test          # run the full suite against the running stack
npm run test:ui   # interactive UI mode
npm run codegen   # record new tests
```
The full stack must be running locally (see Docker Quick Start above) before running E2E tests.

#### Frontend Unit Tests (Vitest)
```bash
cd frontend-v2
npm test
```

## ✨ Features

- **Travel Tracking**: Record and manage travels between locations with duration and distance
- **Visit Management**: Track visits to locations with weighted statistics
- **Location Management**: Create and manage locations with coordinates
- **Interactive Maps**: Visualize travels on Leaflet maps
- **Statistics Dashboard**: View travel statistics, charts, and analytics
- **User Management**: Multi-user support with data isolation
- **Date Range Filtering**: Filter data by custom date ranges
- **Cross Management**: Manage travel crosses and intersections

## 📚 API Endpoints

The full endpoint reference (query params, request/response shapes) lives in [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md). Quick map:

- `/locations` - Location CRUD operations
- `/travels` - Travel management
- `/visits` - Visit tracking
- `/crosses` - Cross management
- `/users` - User management
- `/api/v2/stats` - Statistics & map geometry (Quarkus service, port 8081)

## 🔧 Development

Quick command reference (all local dev workflows are in [Getting Started](#getting-started)):

| Package | Command | Description |
| --- | --- | --- |
| `backend` | `npm test` | Run backend tests (`node:test`) |
| `frontend-v2` | `npm test` | Run Vitest unit tests |
| `frontend-v2` | `npm run lint` | Run ESLint |
| `frontend-v2` | `npm run build` | Production build / typecheck |
| `e2e` | `npm test` | Run Playwright E2E suite |

## 📖 Documentation

- See [`DOCS.md`](DOCS.md) for detailed documentation
- See [`CHANGELOG.md`](CHANGELOG.md) for version history
- See [`docs/ADR.md`](docs/ADR.md) for architecture decisions
- See [`CLAUDE.md`](CLAUDE.md) for repo-wide conventions

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

