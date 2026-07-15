# Keeble

A self-hostable, mobile-first family document vault. Publish guides, checklists, and reference docs — router reboot steps, appliance manuals, insurance contacts — so the rest of the family can self-serve.

## Stack

- **Frontend**: Next.js 16 (standalone), Tailwind CSS v4, shadcn/ui
- **Backend**: FastAPI, Beanie ODM (Motor + Pydantic)
- **Database**: MongoDB 7
- **Auth**: JWT in httpOnly cookies (access + refresh)
- **Deployment**: single Docker container (supervisord manages Next.js + FastAPI), MongoDB in a separate container

## Features

- Multi-step setup wizard (family name + admin account)
- Role-based access: **editor** (create/edit/delete docs) and **reader** (view published docs)
- Markdown documents rendered as accordion-style step guides
- Full-text search across title, content, and tags
- Browse by tag / category
- Image upload with live preview in the editor
- Family member management (invite, change role, remove)
- Multi-tenant: each family's data is fully isolated

## Quick start (development)

**Prerequisites**: [mise](https://mise.jdx.dev/), [Task](https://taskfile.dev/), Docker

```bash
# Install runtimes (Python 3.13 + Node LTS)
mise install

# Install backend dependencies
cd backend && uv sync && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Copy and edit environment
cp .env.example .env
# Set a real JWT_SECRET

# Start MongoDB + both dev servers
task dev
```

The app is available at `http://localhost:3000`. On first visit, the setup wizard creates the family and the first editor account.

## Running tests

```bash
task be:test    # pytest (backend)
task fe:lint    # ESLint (frontend)
```

## Production deployment

```bash
# Create a .env file with at minimum:
# JWT_SECRET=<strong-random-secret>
# COOKIE_SECURE=true

JWT_SECRET=your-secret task docker:build
JWT_SECRET=your-secret task docker:up
```

Or pass the secret directly via Docker Compose:

```bash
JWT_SECRET=your-secret docker compose up -d
```

The app listens on port 3000. MongoDB data and uploaded images are persisted in named volumes (`mongo_data`, `uploads`).

### Deploying the published image

For real deployments, skip building locally and pull the image published to GHCR by the [release workflow](#releases) instead, using [`docker-compose.prod.yml`](docker-compose.prod.yml):

```bash
JWT_SECRET=your-secret task docker:prod:pull
JWT_SECRET=your-secret task docker:prod:up
```

By default this runs `ghcr.io/pygillier/keeble:latest`. Pin to a specific release with `IMAGE_TAG`:

```bash
IMAGE_TAG=v1.2.3 JWT_SECRET=your-secret task docker:prod:up
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | *(required)* | Secret used to sign JWT tokens |
| `MONGO_URI` | `mongodb://mongo:27017` | MongoDB connection string |
| `MONGO_DB_NAME` | `keeble` | Database name |
| `COOKIE_SECURE` | `true` (prod) / `false` (dev) | Set `Secure` flag on auth cookies |
| `UPLOADS_DIR` | `/data/uploads` | Path where uploaded images are stored |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |
| `JWT_ACCESS_TTL_MINUTES` | `15` | Access token lifetime |
| `JWT_REFRESH_TTL_DAYS` | `30` | Refresh token lifetime |

## Project structure

```
Keeble/
├── backend/          # FastAPI app (app/, tests/)
├── frontend/         # Next.js app (src/)
├── Dockerfile        # Multi-stage build (frontend + backend)
├── docker-compose.yml
├── docker-compose.dev.yml   # MongoDB only, for local dev
├── docker-compose.prod.yml  # Real deployments: pulls the ghcr.io image instead of building
├── supervisord.conf  # Manages uvicorn + node in the container
└── Taskfile.yml      # Root task runner
```

## Available tasks

| Task | Description |
|---|---|
| `task dev` | Start MongoDB, backend, and frontend dev servers |
| `task be:dev` | FastAPI dev server only (port 8000) |
| `task fe:dev` | Next.js dev server only (port 3000) |
| `task be:test` | Run backend tests |
| `task be:lint` | Lint backend with ruff |
| `task fe:lint` | Lint frontend with ESLint |
| `task mongo:up` | Start dev MongoDB container |
| `task mongo:down` | Stop dev MongoDB container |
| `task docker:build` | Build the production image |
| `task docker:up` | Start the production stack |
| `task docker:prod:pull` | Pull the published `ghcr.io` image (`IMAGE_TAG` to pin a version) |
| `task docker:prod:up` | Start the production stack using the published `ghcr.io` image |
| `task release:bump -- patch\|minor\|major` | Bump the version and push a git tag, triggering the release workflow |

## Releases

Pushing a `vX.Y.Z` tag (via `task release:bump`) triggers [`.github/workflows/release.yml`](.github/workflows/release.yml), which:

1. Builds the production Docker image and pushes it to `ghcr.io/pygillier/keeble`, tagged with the version (`vX.Y.Z`, `vX.Y`, `vX`) and `latest`.
2. Creates a GitHub release for the tag with auto-generated release notes.
