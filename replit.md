# Hope Street Health Medication Lookup Tool

## Overview

A critical healthcare tool designed for Hope Street Health Center in South Los Angeles to provide accessible medication information to staff and 12,000 low-income patients. The application addresses a critical need after the clinic's EHR system and medication database subscriptions lapsed, helping prevent medication errors and unnecessary ER visits for vulnerable populations.

The tool provides instant access to essential medication information including generic/brand names, usage instructions, warnings, and side effects through a simple search interface optimized for users with limited digital literacy, non-English speakers, and those with vision impairments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, configured for optimized production builds
- **Wouter** for lightweight client-side routing (single-page application with home and 404 routes)

**UI Component System**
- **shadcn/ui** component library (New York style variant) built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Component path aliases configured for clean imports (`@/components`, `@/lib`, `@/hooks`)
- Custom color system defined in CSS variables supporting light/dark modes

**State Management & Data Fetching**
- **TanStack Query (React Query)** for server state management and caching
- Custom query client configured with infinite stale time and disabled auto-refetching (appropriate for static medication data)
- API requests handled through custom `apiRequest` utility with error handling

**Design Philosophy**
- **Accessibility-first**: Minimum 44px touch targets (WCAG AAA), high contrast colors, keyboard navigation support
- **Mobile-responsive**: Breakpoints at 768px (mobile) and 1024px+ (desktop), single-column mobile layout
- **Medical interface standards**: Inspired by government health portals (Medicare.gov, CDC.gov)
- **Typography**: System font stack for maximum compatibility, minimum 16px font size to prevent iOS zoom
- **Visual hierarchy**: Color-coded information (Primary Blue #2C5F8D, Warning Red #C41E3A, Success Green #2D7D46)

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- **ESM modules** throughout the codebase (type: "module" in package.json)
- Custom middleware for request logging with JSON response capture
- Development mode uses tsx for hot-reloading, production uses compiled JavaScript

**API Design**
- RESTful endpoints under `/api` prefix
- Medication search with case-insensitive filtering on generic and brand names
- In-memory data storage via custom `MemStorage` class implementing `IStorage` interface
- CSV file parsing at server startup to load medication database

**Data Storage Strategy**
- **In-memory storage** for medication data (loaded from CSV)
- No database connection required for core functionality (medications are static reference data)
- Database configuration present (Drizzle ORM + PostgreSQL via Neon) but not actively used for medications
- Design allows future migration to persistent storage if needed (session management, audit logs, etc.)

**Production Build Process**
- Vite builds client to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Single compiled artifact for deployment

### External Dependencies

**Third-Party Services**
- **@neondatabase/serverless**: PostgreSQL database adapter (configured but not required for core functionality)
- **Drizzle ORM**: TypeScript ORM configured for PostgreSQL with migrations support

**UI Component Libraries**
- **Radix UI**: Accessible component primitives (accordion, dialog, select, toast, etc.)
- **Lucide React**: Icon library for consistent visual elements
- **cmdk**: Command palette component for potential future search enhancements
- **embla-carousel-react**: Carousel functionality for potential future use

**Development Tools**
- **Replit plugins**: Runtime error modal, cartographer, and dev banner for Replit environment
- **React Hook Form** + **Zod resolvers**: Form validation infrastructure (available for future features)

**CSS & Styling**
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer
- **class-variance-authority**: Type-safe component variant handling
- **tailwind-merge**: Intelligent class merging utility

**Session Management (Configured)**
- **connect-pg-simple**: PostgreSQL session store for Express sessions (infrastructure in place for future authentication)

**Key Architectural Decisions**

1. **In-memory vs Database Storage**: Chose in-memory storage for medication data because it's static reference information that doesn't change frequently. This eliminates database dependency for core functionality while maintaining sub-millisecond query performance.

2. **CSV Data Source**: Medication data loaded from CSV file allows easy updates by non-technical staff without database access. File-based approach aligns with clinic's resource constraints.

3. **No Authentication**: Intentionally omitted to reduce barriers for emergency access. Public health information doesn't require login, prioritizing accessibility over security for non-sensitive reference data.

4. **Shadcn/UI Component Library**: Selected for accessibility compliance (WCAG AA/AAA), consistent design system, and ability to copy/customize components rather than importing from npm package.

5. **Real-time Search Filtering**: Client-side filtering provides instant feedback without network latency, critical for users in high-stress situations who need immediate answers.