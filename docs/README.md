# Keeble

**An open-source family documentation vault.**

Keeble lets non-technical family members find and follow step-by-step guides on their mobile phone — things like "reboot the router", "change the washing machine filter", or "replace a toner cartridge". A desktop view is also provided, optimised for writing and managing those guides.

---

## Who is Keeble for?

| Role | What they do |
|---|---|
| **Family members** | Search and read guides on mobile |
| **Family admin** | Write, organise, and manage guides on desktop |

---

## Key Features

- **Mobile-first reader** — large text, step-by-step sections, full-screen image lightbox
- **Markdown editor** — split-pane with live preview on desktop
- **Full-text search** — instant results across titles, tags, and content
- **Tags** — organise guides by appliance or topic
- **Image uploads** — drag-and-drop photos stored alongside your documents
- **i18n** — English, French, German, and Spanish out of the box
- **Self-hosted** — everything runs in a single Docker container

---

## Quick Start

```bash
docker run -p 3000:3000 \
  -v keeble_data:/app/pb_data \
  -e NEXTAUTH_SECRET=change_me \
  ghcr.io/pygillier/keeble:latest
```

Then open **http://localhost:3000** and follow the setup wizard.

> For a production setup with persistent data, see the [Docker deployment guide](/admin/docker).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Mantine UI v7 |
| Backend / DB | PocketBase (embedded SQLite) |
| Document format | Markdown |
| Deployment | Single Docker image |
