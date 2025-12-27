# Timeline App Frontend v2

A modern Next.js frontend for tracking travels, visits, and locations with interactive maps.

## Tech Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **Leaflet** for interactive maps

## Features

- 🗺️ **Interactive Maps** - Visualize travels with origin and destination markers
- 🚗 **Travels Management** - Track journeys between locations
- 🏠 **Visits Management** - Record visits to different places
- 📍 **Locations Management** - Manage locations with coordinates
- 📱 **Responsive Design** - Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:3000/api`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3002](http://localhost:3002) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── locations/         # Locations page
│   ├── travels/          # Travels page
│   ├── visits/           # Visits page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Navigation header
│   ├── LocationForm.tsx  # Location creation form
│   └── LocationTable.tsx # Locations data table
├── hooks/                 # Custom React hooks
├── services/              # API service classes
├── types/                 # TypeScript type definitions
└── constants/             # App constants
```

## Migration from v1

This frontend v2 is a complete rewrite of the original React/Vite frontend, featuring:

- ✅ Modern Next.js architecture
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui component library
- ✅ Improved performance and SEO
- ✅ Better developer experience
- ✅ Responsive design patterns

## Development

- **Components**: Built with shadcn/ui and Tailwind CSS
- **State Management**: React hooks and custom hooks
- **API Integration**: Axios-based services
- **Type Safety**: Full TypeScript support
- **Styling**: Utility-first CSS with Tailwind

## Contributing

1. Follow the established component patterns
2. Use shadcn/ui components when possible
3. Apply Tailwind CSS classes consistently
4. Maintain TypeScript strictness
5. Test responsive design across breakpoints
