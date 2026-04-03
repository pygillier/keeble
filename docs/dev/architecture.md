# Architecture

## Overview

```
Browser / Mobile
      │
      ▼
Next.js 14 (App Router)   ← SSR + Client Components
      │  REST / Realtime
      ▼
PocketBase  ──►  SQLite (pb_data volume)
                 File storage (pb_data/storage/)
```

Keeble ships as a **single Docker image** running both Next.js and PocketBase under `supervisord`.

## Directory Structure

```
keeble/
├── pocketbase/
│   ├── pb_migrations/     # Database migrations (auto-applied on start)
│   └── pb_hooks/          # PocketBase server-side hooks (JS)
│
└── web/
    └── src/
        ├── app/
        │   ├── (auth)/    # /login, /register
        │   ├── (app)/     # Authenticated shell
        │   │   ├── page.tsx          # Home / search
        │   │   ├── doc/[id]/         # Document viewer
        │   │   ├── edit/[id]/        # Editor
        │   │   └── tags/             # Tag browser
        │   └── setup/     # Onboarding wizard
        ├── components/
        │   ├── ui/        # Shared primitives
        │   ├── doc/       # Viewer, editor, card components
        │   ├── search/    # Search bar and results
        │   └── layout/    # Shell, nav, header
        ├── lib/
        │   ├── pb.ts      # PocketBase client singleton
        │   ├── markdown.ts # Frontmatter parsing / serialisation
        │   ├── i18n/      # Locale JSON files
        │   └── hooks/     # useSearch, useDocs, useAuth
        └── types/
            └── index.ts
```

## Data Model

### `documents`

| Field | Type | Notes |
|---|---|---|
| `id` | auto | PocketBase default |
| `title` | text | Required, indexed |
| `slug` | text | Unique, URL-safe |
| `body` | text | Markdown content |
| `tags` | relation[] | → `tags` collection |
| `images` | file[] | Uploaded images |
| `author` | relation | → `users` |
| `created` | auto | |
| `updated` | auto | |

### `tags`

| Field | Type |
|---|---|
| `id` | auto |
| `name` | text (unique) |
| `color` | text (hex) |

### `settings` (single record)

| Field | Type | Notes |
|---|---|---|
| `app_name` | text | Default "Keeble" |
| `default_locale` | text | e.g. `en` |
| `allow_registration` | bool | |
| `setup_completed` | bool | Guards /setup |

## Key Conventions

- **Server Components by default.** Use `"use client"` only where interactivity is required.
- **PocketBase calls go through `lib/pb.ts`** — never import the SDK directly in components.
- **All user-facing strings use `next-intl`** — no hardcoded English in JSX.
- **Document mutations call `revalidatePath`** to invalidate the Next.js cache.
- **Authentication** — use `getCurrentUserAction()` to fetch the current user; do not rely on auth cookies directly.

## Authentication Flow

```
User submits login form
      │
      ▼
Server Action (auth/login)
      │  PocketBase authWithPassword()
      ▼
Session cookie set (httpOnly)
      │
      ▼
getCurrentUserAction() — called on each protected page
```

## Search

PocketBase full-text filter is applied on `title`, `body`, and `tags.name`. The query is debounced (300 ms) in the UI hook before being sent to PocketBase.

Results are sorted client-side: title match → tag match → body match.
