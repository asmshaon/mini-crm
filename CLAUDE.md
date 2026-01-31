# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js frontend.

## Project Structure

```
app/                      # Next.js App Router
├── layout.tsx            # Root layout with AuthProvider + Toaster
├── page.tsx              # Dashboard/home page
├── login/                # Login page
├── register/             # Registration page
└── customers/            # Customer management
    ├── page.tsx          # Customer list with search
    ├── new/              # Create customer
    ├── [id]/             # Customer detail/edit
    └── import/           # Bulk Excel/CSV import

components/
├── navbar.tsx            # Navigation bar
└── ui/                   # Reusable UI components
    ├── button.tsx
    ├── input.tsx
    ├── textarea.tsx
    ├── select.tsx
    ├── label.tsx
    ├── badge.tsx
    ├── card.tsx
    └── dialog.tsx        # ConfirmDialog for confirmations

lib/
├── api-client.ts         # API client with auth token handling
├── auth-context.tsx      # Auth context with protected routes
├── types.ts              # TypeScript types
└── utils.ts              # Utility functions

supabase/
└── migrations/           # Database migrations
```

## Key Patterns

### Client Components

Use `"use client"` directive at the top of files that:

- Use hooks (useState, useEffect, etc.)
- Handle user interactions (forms, clicks)
- Need access to browser APIs (localStorage)

### Authentication

The app uses JWT-based auth via `api-client.ts`:

```typescript
import { authApi } from "@/lib/api-client";

// Login - stores token in localStorage
await authApi.login(email, password);

// Logout - removes token
await authApi.logout();

// Get current user
const res = await authApi.getMe();
```

The `AuthProvider` in `lib/auth-context.tsx`:

- Checks auth on app load via `/auth/me`
- Redirects unauthenticated users from protected routes
- Redirects authenticated users from login/register to `/customers`
- Provides `useAuth()` hook for accessing user state

**Public paths**: `/`, `/login`, `/register`

### API Client

All API calls go through `api-client.ts`:

```typescript
import { customersApi } from "@/lib/api-client";

// List with pagination
const res = await customersApi.list(search, page, limit);
const data = await res.json();

// Create
const res = await customersApi.create({...});
// Get, update, delete also available
```

Token is automatically attached to requests from localStorage.

### Toast Notifications

Use Sonner for notifications:

```typescript
import { toast } from "sonner";

toast.loading("Loading...");
toast.success("Success message", { id: toastId });
toast.error("Error message");
```

### Styling

- **Tailwind CSS v4** - utility-first CSS
- **clsx** - conditional classes
- **tailwind-merge** - merge Tailwind classes

```typescript
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class")} />
```

## UI Components

Located in `components/ui/`:

- `Button` - Primary, outline, ghost variants
- `Input` - Form inputs
- `Textarea` - Multi-line text
- `Select` - Dropdown selection
- `Label` - Form labels
- `Badge` - Status indicators (active, inactive, lead)
- `Card` - Container components
- `Dialog/ConfirmDialog` - Modal confirmations

## Customer Import

The import feature at `/customers/import`:

- Accepts Excel (.xlsx) and CSV files
- Backend processes file and returns results
- Displays success/failed counts and per-row errors

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Adding New Pages

1. Create folder under `app/` (e.g., `app/features/`)
2. Add `page.tsx` for the page component
3. Use `"use client"` if needed for interactivity
4. For protected routes, no additional code needed - `AuthProvider` handles it
5. Add navigation link in `components/navbar.tsx` if needed

## Adding New API Calls

Add to `lib/api-client.ts`:

```typescript
export const featuresApi = {
  list: () => apiRequest("/features"),

  get: (id: string) => apiRequest(`/features/${id}`),

  create: (data) =>
    apiRequest("/features", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
```

## Type Safety

Types are defined in `lib/types.ts` and shared with backend:

- `Customer` - customer data structure
- `CustomerStatus` - "active" | "inactive" | "lead"
- `User` - authenticated user structure
