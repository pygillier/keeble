# Quick Start: Deploying Keeble

Keeble ships as a single application container (FastAPI + Next.js, managed by
supervisord) plus a MongoDB container. This guide covers a production
deployment with Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with the Compose plugin
- A server or machine with port `3000` free

## 1. Configure environment variables

At minimum, set a strong `JWT_SECRET` and enable secure cookies:

```bash
export JWT_SECRET=$(openssl rand -hex 32)
export COOKIE_SECURE=true
```

You can also create a `.env` file next to `docker-compose.yml` with the same
variables — Docker Compose picks it up automatically.

### Environment variable reference

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | *(required)* | Secret used to sign JWT tokens |
| `MONGO_URI` | `mongodb://mongo:27017` | MongoDB connection string |
| `MONGO_DB_NAME` | `keeble` | Database name |
| `COOKIE_SECURE` | `true` (prod) / `false` (dev) | Set the `Secure` flag on auth cookies |
| `UPLOADS_DIR` | `/data/uploads` | Path where uploaded images are stored |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |
| `JWT_ACCESS_TTL_MINUTES` | `15` | Access token lifetime |
| `JWT_REFRESH_TTL_DAYS` | `30` | Refresh token lifetime |

## 2. Build and start the stack

```bash
docker compose up -d
```

If you have [Task](https://taskfile.dev/) installed, you can instead run:

```bash
JWT_SECRET=your-secret task docker:build
JWT_SECRET=your-secret task docker:up
```

This starts two containers:

- `mongo` — MongoDB 7, with its data persisted in the `mongo_data` named
  volume
- `app` — the Keeble application (FastAPI on port 8000 and Next.js on port
  3000, both managed by supervisord inside the container), with uploaded
  images persisted in the `uploads` named volume

The `app` container waits for MongoDB's healthcheck before starting.

## 3. Open Keeble and complete setup

Visit `http://<your-host>:3000`. On first visit you'll be redirected to a
setup wizard that asks for:

- A family name
- The first account's name, email, and password

The first account created is granted the **editor** role, giving it full
access to write documents and manage family members. See the
{doc}`usage/index` guide for what each role can do next.

## Updating

To update to a new version, pull the latest source, rebuild the image, and
restart the stack:

```bash
docker compose build
docker compose up -d
```

MongoDB data and uploaded images are preserved across restarts and rebuilds
because they live in named volumes, not in the container itself.
