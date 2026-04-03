# Settings

The Settings page is accessible to admins via the user menu (top-right avatar → Settings).

## General

| Setting | Description |
|---|---|
| **Family name** | Displayed in the app header |
| **Default language** | Locale used for new visitors before they set a preference |
| **Allow registration** | Enables the `/register` page for self-service sign-up |

## Appearance

Keeble uses a fixed colour theme based on the Mantine design system. Custom theming is not yet supported in the UI but can be done by modifying the source code.

## Data & Backups

Keeble stores all data in PocketBase (SQLite). The entire database is a single file located at:

```
/app/pb_data/data.db
```

To back up your data, copy the `pb_data` volume contents to a safe location. If you are using the recommended `docker-compose.yml`, this is the `pb_data` named volume.

```bash
# Example: back up to a tar file
docker run --rm \
  -v keeble_pb_data:/source:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/keeble-backup-$(date +%F).tar.gz -C /source .
```
