# ── Stage 1: install frontend deps ──────────────────────────────────────────
FROM node:22-slim AS frontend-deps
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci

# ── Stage 2: build Next.js standalone ───────────────────────────────────────
FROM frontend-deps AS frontend-builder
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY frontend/ ./
RUN npm run build

# ── Stage 3: install backend deps with uv ───────────────────────────────────
FROM python:3.13-slim AS backend-builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /build/backend
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev

# ── Stage 4: runtime ────────────────────────────────────────────────────────
FROM python:3.13-slim AS runtime

# Install Node.js 22 and supervisord; purge curl after bootstrapping nodesource
RUN apt-get update && apt-get install -y --no-install-recommends curl supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get purge -y --auto-remove curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend: virtualenv + source
COPY --from=backend-builder /build/backend/.venv /app/backend/.venv
COPY backend/app /app/backend/app

# Frontend: standalone server + static assets
COPY --from=frontend-builder /build/frontend/.next/standalone /app/frontend
COPY --from=frontend-builder /build/frontend/.next/static /app/frontend/.next/static
COPY --from=frontend-builder /build/frontend/public /app/frontend/public

# Supervisord config
COPY supervisord.conf /etc/supervisor/conf.d/keeble.conf

EXPOSE 3000

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
