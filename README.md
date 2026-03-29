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
├── backend/          # Express API server
│   ├── controllers/  # Request handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   └── services/     # Business logic
│
├── statistics-service/ # Quarkus Stats microservice (Java)
│   ├── src/          # Source code
│   └── pom.xml       # Maven dependencies
│
└── frontend-v2/      # Next.js application
    └── src/
        ├── app/      # Next.js pages (Server Components)
        ├── components/ # React components
        ├── hooks/     # Custom React hooks
        ├── services/  # API client services
        └── contexts/  # React contexts
```

## 🛠️ Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20.9+ (for local frontend development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd timeline-app
```

2. Create a `.env` file in the root directory:
```env
# Add your environment variables here
MONGO_URI="mongodb://mongo:27017/timeline_db"
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
- **Mongo Express** on port `8082` (Web UI for Database management and recovery)
- **Backend API** on port `3000`
- **Statistics Service** on port `8081`
- **Frontend** on port `3002`

> **⚠️ Important**: When making changes to the frontend code, always use the `--build` flag to force a rebuild:
> ```bash
> docker compose up --build -d
> ```
> This ensures Next.js recompiles with your latest changes.

4. Open your browser:
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


## ✨ Features

- **Travel Tracking**: Record and manage travels between locations with duration and distance
- **Visit Management**: Track visits to locations with weighted statistics
- **Location Management**: Create and manage locations with coordinates
- **Interactive Maps**: Visualize travels on Leaflet maps
- **Statistics Dashboard**: View travel statistics, charts, and analytics
- **User Management**: Multi-user support with data isolation
- **Date Range Filtering**: Filter data by custom date ranges
- **Cross Management**: Manage travel crosses and intersections
- **Dark Mode**: Theme support with system preference detection

## 📚 API Endpoints

The backend provides RESTful endpoints for:
- `/locations` - Location CRUD operations
- `/travels` - Travel management
- `/visits` - Visit tracking
- `/crosses` - Cross management
- `/users` - User management
- `/stats` - Basic statistics (Node.js)
- `/api/v2/stats` - Advanced analytics (Quarkus - port 8081)

## 🔧 Development

### Backend Scripts
```bash
cd backend
npm start        # Start the server
```

### Frontend Scripts
```bash
cd frontend-v2
npm run dev      # Development server (Turbopack by default)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📖 Documentation

- See `DOCS.md` for detailed documentation
- See `CHANGELOG.md` for version history

## 🐳 Docker Services

- **mongo**: MongoDB database
- **mongo-express**: Web-based MongoDB admin interface (Useful for recovering accidental user deletions)
- **backend**: Express API server
- **stats**: Quarkus Statistics microservice
- **frontend-v2**: Next.js application

## 🗄️ Database Management (Mongo Express)

A Mongo Express instance is included in the Docker stack to provide a web-based administrative interface for the MongoDB database. 

This is particularly useful for debugging or in emergency scenarios, such as **recovering from an accidental user deletion** or manually repairing records.

**To access it:**
1. Ensure the container is running: `docker compose up -d mongo-express`
2. Open your browser and navigate to: **http://localhost:8082**
3. Log in using the default credentials:
   - **Username**: `admin`
   - **Password**: `password`

## 📝 Notes

- The frontend uses **Server Components** by default for optimal performance
- Client-side interactivity is isolated to specific components
- User data migration is available for transitioning from guest mode

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

