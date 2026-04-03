# Developer Getting Started

## Prerequisites

- Node.js 20+
- npm 9+
- A PocketBase binary (downloaded automatically by the setup script, or manually from [pocketbase.io](https://pocketbase.io/docs/))

## 1. Clone the Repository

```bash
git clone https://github.com/pygillier/keeble.git
cd keeble
```

## 2. Configure Environment

```bash
cp .env.example web/.env.local
# Defaults work for local development — no changes needed
```

## 3. Start PocketBase

```bash
./pocketbase/pocketbase serve --dir ./pocketbase/pb_data
```

The PocketBase admin UI is available at **http://localhost:8090/_/**.

## 4. Start the Next.js Dev Server

```bash
cd web
npm install
npm run dev
```

The app is available at **http://localhost:3000**.

## 5. Run the Setup Wizard

Navigate to **http://localhost:3000/setup** to create your admin account and configure Keeble for development.

## Available Scripts

Run these from the `web/` directory:

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the production bundle |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests with Vitest |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Code Style

- TypeScript strict mode is enforced.
- ESLint and Prettier are configured. Run `npm run lint` before submitting a PR.
- Mantine theme tokens must be used for all colours and spacing — no hardcoded values.
