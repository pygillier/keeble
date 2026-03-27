# Stage 1 – build Next.js
FROM node:20-alpine AS web-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build

# Stage 2 – download PocketBase
FROM alpine:3.19 AS pb-downloader
ARG PB_VERSION=0.36.7
RUN apk add --no-cache wget unzip && \
    wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_*.zip -d /pb

# Stage 3 – final image
FROM node:20-alpine
RUN apk add --no-cache supervisor

WORKDIR /app

# PocketBase binary
COPY --from=pb-downloader /pb/pocketbase /usr/local/bin/pocketbase

# Next.js standalone build
COPY --from=web-builder /app/web/.next/standalone ./
COPY --from=web-builder /app/web/.next/static ./.next/static
COPY --from=web-builder /app/web/public ./public

# PocketBase migrations and hooks
COPY pocketbase/pb_migrations ./pb_migrations
COPY pocketbase/pb_hooks ./pb_hooks

# Supervisord config
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 3000 8090

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
