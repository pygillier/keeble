# Keeble

[![pre-commit.ci status](https://results.pre-commit.ci/badge/github/pygillier/keeble/main.svg)](https://results.pre-commit.ci/latest/github/pygillier/keeble/main)

An open-source family documentation vault. Non-technical family members can find and follow step-by-step guides on mobile (e.g. "reboot the router", "change the washing machine filter"). A desktop view is provided for writing and managing documents.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Mantine UI v7
- **Backend / DB**: PocketBase (embedded SQLite)
- **Documents**: Markdown with YAML frontmatter
- **Deployment**: Single Docker image

## Development Setup

### Prerequisites

- Node.js 20+
- npm 9+

### 1. Clone the repo

```bash
git clone https://github.com/your-org/keeble.git
cd keeble
```

### 2. Configure environment

```bash
cp .env.example web/.env.local
# Edit web/.env.local if needed (defaults work for local dev)
```

### 3. Start PocketBase

```bash
./pocketbase/pocketbase serve --dir ./pocketbase/pb_data
```

PocketBase admin UI will be available at <http://localhost:8090/_/>

### 4. Start the Next.js dev server

```bash
cd web
npm install
npm run dev
```

### 5. Open the setup wizard

Navigate to <http://localhost:3000/setup> to create your admin account and configure Keeble.

## Project Structure

```txt
keeble/
├── pocketbase/          # PocketBase binary + migrations
│   ├── pb_migrations/
│   └── pb_hooks/
└── web/                 # Next.js application
    └── src/
        ├── app/         # App Router pages
        ├── components/  # UI components
        ├── lib/         # Utilities, PB client, i18n, hooks
        └── types/       # TypeScript types
```

## Docker Deployment

```bash
docker compose up --build
```

Access Keeble at <http://localhost:3000>.

## Contributing

1. Fork → branch (`feat/my-feature`) → PR against `main`
2. PRs must pass `npm run lint` and unit tests
3. Translations welcome — add a file under `web/src/lib/i18n/`
