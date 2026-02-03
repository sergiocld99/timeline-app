# Timeline App

A full-stack application for tracking travels, visits, and locations with interactive maps, statistics, and user management.

## 🚀 Tech Stack

### Backend
- **Node.js** with **Express** (v5)
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
```

3. Start all services:
```bash
docker compose up --build -d
```

This will start:
- **MongoDB** on port `27017`
- **Backend API** on port `3000`
- **Frontend** on port `3002`

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
- `/stats` - Statistics and analytics

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
- **backend**: Express API server
- **frontend-v2**: Next.js application

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

