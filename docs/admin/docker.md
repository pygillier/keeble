# Docker Deployment

The recommended way to run Keeble in production is with Docker Compose.

## Prerequisites

- Docker 24+ and Docker Compose v2

## docker-compose.yml

Create a `docker-compose.yml` file:

```yaml
services:
  keeble:
    image: ghcr.io/pygillier/keeble:latest
    ports:
      - "3000:3000"
    volumes:
      - pb_data:/app/pb_data
    environment:
      - POCKETBASE_URL=http://localhost:8090
      - NEXTAUTH_SECRET=change_me_to_a_random_string

volumes:
  pb_data:
```

> Replace `change_me_to_a_random_string` with a long random value. You can generate one with:
> ```bash
> openssl rand -base64 32
> ```

## Starting Keeble

```bash
docker compose up -d
```

Open **http://localhost:3000** in your browser. You will be redirected to the setup wizard on first run.

## Updating

```bash
docker compose pull
docker compose up -d
```

PocketBase runs database migrations automatically on startup, so your data is preserved across updates.

## Pinning a Version

Replace `latest` with a specific version tag for reproducible deployments:

```yaml
image: ghcr.io/pygillier/keeble:1.2.0
```

Available tags are listed on the [GitHub Packages page](https://github.com/pygillier/keeble/pkgs/container/keeble).

## Exposing to the Internet

Keeble does not include a reverse proxy. Use **Caddy**, **Nginx**, or **Traefik** in front of it for TLS termination.

Example with Caddy:

```
your-domain.example.com {
    reverse_proxy keeble:3000
}
```

## Ports

| Port | Service |
|---|---|
| `3000` | Next.js web app |
| `8090` | PocketBase admin UI (do not expose publicly) |

Only expose port `3000`. The PocketBase admin UI on `8090` should remain internal.
