# Contributing

Keeble is a FastAPI + Beanie/MongoDB backend paired with a Next.js frontend,
managed with [mise](https://mise.jdx.dev/) and [Task](https://taskfile.dev/).

## Prerequisites

- [mise](https://mise.jdx.dev/) — pins Python 3.13 and Node LTS
- [Task](https://taskfile.dev/) — the project's task runner
- Docker — for running MongoDB locally

## Setting up your environment

```bash
# Install pinned runtimes (Python 3.13 + Node LTS)
mise install

# Install backend dependencies
cd backend && uv sync && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Copy and edit environment variables
cp .env.example .env
# Set a real JWT_SECRET in .env
```

## Running the app locally

```bash
task dev
```

This starts MongoDB (via Docker), the FastAPI dev server, and the Next.js
dev server together. The app is available at `http://localhost:3000`.

You can also run each service individually:

| Task | Description |
|---|---|
| `task mongo:up` / `task mongo:down` | Start/stop the dev MongoDB container |
| `task be:dev` | FastAPI dev server only (port 8000) |
| `task fe:dev` | Next.js dev server only (port 3000) |

## Tests and linting

```bash
task be:test    # pytest (backend) — spins up a scratch MongoDB test database
task be:lint    # ruff (backend)
task fe:lint    # ESLint (frontend)
```

Run these before opening a pull request.

## Pre-commit hooks

The repository ships a `.pre-commit-config.yaml` covering ruff, ruff-format,
ESLint, and standard file hygiene checks. Install it once per clone:

```bash
pip install pre-commit
pre-commit install
```

Hooks then run automatically on `git commit`.

## Project structure

```
Keeble/
├── backend/          # FastAPI app (app/, tests/)
├── frontend/         # Next.js app (src/)
├── docs/             # This documentation (Sphinx)
├── Dockerfile         # Multi-stage build (frontend + backend)
├── docker-compose.yml
├── docker-compose.dev.yml   # MongoDB only, for local dev
├── supervisord.conf   # Manages uvicorn + node in the production container
└── Taskfile.yml       # Root task runner
```

## Submitting changes

- Open pull requests against `main`
- Make sure `task be:test`, `task be:lint`, and `task fe:lint` all pass
  locally before requesting review
- Write commit messages as a short, imperative summary of the change (e.g.
  "Add document tag filtering")

There is no CI pipeline configured yet, so these checks are currently the
only gate before merge — please don't skip them.
