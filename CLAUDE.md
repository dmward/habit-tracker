# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite build
npm run lint         # Run ESLint
npm run test         # Run Vitest in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:coverage # Run tests with coverage report
```

### Local Supabase (requires Docker)
```bash
npm run supabase:start  # Start local Supabase
npm run supabase:stop   # Stop local Supabase
npm run supabase:reset  # Reset database (re-run migrations)
```

Local Supabase Studio: http://127.0.0.1:54323

## Architecture Overview

### State Management (Zustand)
Three stores manage application state, all located in `src/store/`:

- **authStore.ts**: Handles Supabase authentication. Uses `setDataStoreCallbacks()` to coordinate initialization of other stores on login/logout.
- **habitStore.ts**: Core store for habits and completions. Uses optimistic updates with rollback on error. Habits are scoped by month (`YYYY-MM` format).
- **journalStore.ts**: Daily journal entries with optimistic updates.

All stores follow the same pattern:
- `initialize()` loads data from Supabase on auth
- `reset()` clears data on logout
- Optimistic updates with server sync, reloading on failure

### Data Layer
- `src/lib/supabase.ts`: Supabase client instance
- `src/lib/supabaseData.ts`: Service layer with `habitsService`, `completionsService`, `journalService`
- `src/types/database.ts`: DB row types (`DbHabit`, `DbHabitCompletion`, `DbJournalEntry`) and conversion functions between DB snake_case and client camelCase

### Type System
- `src/types/habit.ts`: `Habit`, `HabitCompletion`, `HabitTemplate` types. Habits have two types: `checkbox` (yes/no) and `numeric` (with value tracking).
- `src/types/journal.ts`: `JournalEntry` type
- `src/types/database.ts`: Mapping between frontend types and Supabase schema

### Routing
Routes defined in `src/App.tsx`:
- `/login` - Public login page
- `/` - Dashboard (protected, default)
- `/calendar` - Calendar view
- `/habits` - Habit management
- `/analytics` - Stats and charts
- `/settings` - App settings

All authenticated routes wrap in `ProtectedRoute` and use `Layout` component.

## Testing

Tests use Vitest with jsdom environment. Setup file: `src/test/setup.ts`

Run a single test file:
```bash
npx vitest src/store/journalStore.test.ts
```

Run tests matching a pattern:
```bash
npx vitest -t "pattern"
```

## Database

Schema migrations in `supabase/migrations/`:
- `00001_initial_schema.sql`: Tables for habits, habit_completions, journal_entries
- `00002_rls_policies.sql`: Row Level Security policies (users access only their own data)

Tables: `habits`, `habit_completions`, `journal_entries`

Unique constraints:
- `habit_completions`: `(user_id, habit_id, date)` for upserts
- `journal_entries`: `(user_id, date)` for upserts
