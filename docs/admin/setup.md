# Setup Wizard

The first time you open Keeble, you are redirected to `/setup` to configure your instance. This wizard runs once; after completion it is locked.

## Steps

### 1. Welcome

An introduction screen. Click **Get Started** to begin.

### 2. Create Admin Account

Enter your:
- **Email address** — used to log in
- **Password** — minimum 8 characters
- **Display name** — how you appear to other users

This account will have full admin privileges.

> Keep your credentials safe. If you lose access, you can reset them via the PocketBase admin UI at `http://your-host:8090/_/`.

### 3. Family Settings

Configure your Keeble instance:

| Setting | Description |
|---|---|
| **Family name** | Shown in the app header (e.g. "The Smith Family Guides") |
| **Default language** | Language shown to users who haven't set a preference |
| **Allow registration** | Whether new users can sign up themselves |

### 4. Starter Documents (Optional)

You can import a set of example documents to get started. These are generic guides (rebooting a router, replacing a filter, etc.) that you can edit or delete later.

Click **Skip** to start with an empty library.

### 5. Done

Setup is marked complete and you are redirected to the main app.

## Re-running Setup

Setup cannot be re-run from the UI once completed. To reset:

1. Open the PocketBase admin UI at `http://your-host:8090/_/`.
2. Navigate to **Collections → settings**.
3. Set `setup_completed` to `false`.
4. Restart the container.
