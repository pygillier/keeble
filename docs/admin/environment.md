# Environment Variables

Configure Keeble through the following environment variables.

## Required

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Secret used to sign session cookies. Use a random 32+ character string. |

## Optional

| Variable | Default | Description |
|---|---|---|
| `POCKETBASE_URL` | `http://localhost:8090` | Internal URL of the PocketBase server. Change only if PocketBase runs on a separate host. |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public-facing URL of the app. Used for generating absolute links. |

## Example `.env` File

```bash
NEXTAUTH_SECRET=your-random-secret-here
POCKETBASE_URL=http://localhost:8090
NEXT_PUBLIC_APP_URL=https://keeble.example.com
```

## Notes

- `NEXT_PUBLIC_*` variables are embedded into the Next.js client bundle at build time. If you change them, you must rebuild the Docker image.
- `POCKETBASE_URL` is server-side only and can be changed without rebuilding.
