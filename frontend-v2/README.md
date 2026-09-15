# Timeline App Frontend v2

A modern Next.js frontend for tracking travels, visits, and locations with interactive maps.

## Tech Stack

- **Next.js 16** with App Router (Turbopack by default)
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **Leaflet** for interactive maps
- **Recharts** for charts

## Features

- 🗺️ **Interactive Maps** - Visualize travels with origin and destination markers
- 🚗 **Travels Management** - Track journeys between locations
- 🏠 **Visits Management** - Record visits to different places
- 📍 **Locations Management** - Manage locations with coordinates
- 📱 **Responsive Design** - Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 22+ (aligned with `engines` in `package.json`)
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

### Tests

Unit tests run with **Vitest** (`jsdom` environment):

```bash
npm test
```

Tests live in `src/test/`. E2E tests are tracked separately in the monorepo's `e2e/` package (Playwright).

## Project Structure

```
src/
├── app/                    # Next.js App Router — all routes live under [locale]
│   └── [locale]/           # en / es (next-intl): creator, crosses, locations, travels, visits, …
│       └── <route>/page.tsx   # Server Component entry per page
├── components/             # React components
│   ├── buttons/           # Reusable action buttons (shared ButtonProps type)
│   ├── pages/             # Client Component pages (<X>PageClient.tsx)
│   ├── ui/                # shadcn/ui primitives
│   ├── map/               # Leaflet map components
│   └── …                  # Feature components
├── contexts/               # React contexts (DateRange, User)
├── hooks/                  # Custom React hooks
├── providers/              # App providers (incl. QueryProvider — TanStack Query)
├── services/               # API client wrappers per entity
├── i18n/                   # next-intl routing/config
├── lib/                    # Utilities (cn, etc.)
├── utils/                  # App utilities (dates, file helpers, etc.)
├── types/                  # Shared TypeScript type definitions (*.d.ts)
├── proxy.ts               # next-intl middleware for /en, /es routing
└── test/                   # Vitest unit tests
```

## Development

- **Components**: Built with shadcn/ui and Tailwind CSS
- **State Management**: TanStack Query for server state + React hooks/contexts for local state
- **API Integration**: Axios-based service wrappers (Node backend, with stats-service where applicable)
- **i18n**: `next-intl` with `en`/`es` locales (default `en`)
- **Type Safety**: Full TypeScript; use `type` (never `interface`) for type declarations
- **Styling**: Utility-first CSS with Tailwind
- **Lint**: ESLint (flat config, enforced import order); run with `npm run lint`

## Contributing

1. Follow the established component patterns
2. Use shadcn/ui components when possible
3. Apply Tailwind CSS classes consistently
4. Maintain TypeScript strictness
5. Test responsive design across breakpoints
