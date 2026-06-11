# Keeble — Family Document Vault: Initial Build Plan

## Context

Keeble is a self-hostable, mobile-first family document vault. A father (or any family member) can publish guides/checklists/reference docs (router reboot steps, appliance manuals, insurance providers, etc.) so the rest of the family can self-serve while he's away. The project is currently empty except for `reference/` (color scheme, mobile screen mockups, and an interactive prototype). This plan scaffolds a 3-tier app — Next.js frontend, FastAPI backend, MongoDB — matching the reference design, with JWT cookie auth, role-based access (reader/editor), multi-family (multi-tenant) support, and a docker-compose deployment with 2 containers (mongo + combined app).

Decisions already made:
- Auth: JWT in httpOnly secure cookies (access + refresh), validated by FastAPI
- DB access: Beanie ODM (Motor + Pydantic) over MongoDB
- Image uploads: local filesystem volume, served via FastAPI static route
- UI: Tailwind CSS + shadcn/ui, themed to the Keeble palette (Forest #2B6E4E, Leaf #3D9970, Mist #EAF5EE, Parchment #F7F5F0, Amber #D97B4F, Rust #C0392B, Slate #2C3E50, Stone #95A5A6; fonts DM Sans + Lora)

## Repository layout

```
Keeble/
├── mise.toml                  # python 3.13, node LTS
├── Taskfile.yml                # root tasks delegating to backend/frontend
├── docker-compose.yml          # mongo + app (prod)
├── docker-compose.dev.yml      # optional: mongo only, for local dev
├── .env.example
├── reference/                  # existing mockups (untouched)
├── backend/
│   ├── pyproject.toml          # uv-managed, FastAPI, beanie, motor, pydantic, python-jose/pyjwt, passlib
│   ├── Taskfile.yml
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, static mount for /uploads
│   │   ├── config.py             # pydantic-settings: mongo URI, JWT secrets, cookie settings
│   │   ├── db.py                  # Beanie init, Motor client
│   │   ├── models/                # Beanie documents
│   │   │   ├── family.py          # Family
│   │   │   ├── user.py            # Member/User (linked to family_id, role)
│   │   │   ├── document.py        # Document (title, tags, content md, author, status, family_id)
│   │   │   └── tag.py             # Tag (or embedded as string list on Document)
│   │   ├── schemas/                # Pydantic request/response models
│   │   ├── auth/
│   │   │   ├── security.py         # password hashing (passlib/bcrypt), JWT encode/decode
│   │   │   ├── deps.py              # get_current_user, require_role(editor) dependencies
│   │   │   └── router.py            # /auth/login, /auth/refresh, /auth/logout
│   │   ├── routers/
│   │   │   ├── setup.py             # POST /setup — first-run wizard (create family + admin)
│   │   │   ├── documents.py         # CRUD + search for documents
│   │   │   ├── tags.py              # list tags / browse by tag
│   │   │   ├── members.py           # manage family members (editor only)
│   │   │   └── uploads.py           # image upload endpoint
│   │   └── deps.py                  # shared deps (current family scoping)
│   └── tests/
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts        # maps Keeble design tokens to Tailwind theme
    ├── Taskfile.yml
    ├── middleware.ts              # checks auth cookie, redirects to /login or /setup
    └── src/
        ├── app/
        │   ├── layout.tsx          # fonts (DM Sans + Lora), global styles
        │   ├── globals.css         # CSS variables from design tokens
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── setup/page.tsx   # multi-step wizard (family + admin account)
        │   └── (app)/
        │       ├── layout.tsx       # shell with bottom nav (mobile) / top nav (desktop)
        │       ├── page.tsx          # Home: search bar, category tags, recent guides, FAB
        │       ├── search/page.tsx
        │       ├── tags/page.tsx
        │       ├── tags/[tag]/page.tsx
        │       ├── docs/[slug]/page.tsx        # Document view with accordion steps
        │       ├── docs/[slug]/edit/page.tsx   # Desktop editor (markdown + preview, sidebar)
        │       ├── docs/new/page.tsx
        │       └── profile/page.tsx
        ├── components/
        │   ├── ui/                   # shadcn primitives (accordion, button, input, badge, dialog)
        │   ├── doc-card.tsx
        │   ├── tag-badge.tsx
        │   ├── bottom-nav.tsx
        │   ├── step-accordion.tsx
        │   └── markdown-renderer.tsx  # renders doc content into accordion "step" sections
        └── lib/
            ├── api.ts                # fetch wrapper, sends cookies, base URL
            └── auth.ts               # server-side helpers to read session in RSC/middleware
```

## Backend design

### Data model (Beanie documents)
- **Family**: `name`, `created_at`
- **User** (family member): `email`, `password_hash`, `display_name`, `role` (`"reader" | "editor"`), `family_id` (Link to Family)
- **Document**: `family_id`, `title`, `slug`, `tags: list[str]`, `content_md: str`, `author_id`, `status` (`"draft" | "published"`), `created_at`, `updated_at`
- All document/member queries are scoped by `family_id` taken from the authenticated user's JWT — this is the multi-tenancy boundary. No cross-family queries.

### Auth flow
- `POST /setup` — only works if no Family exists yet (or per-instance check); creates Family + first User with role `editor`, returns cookies. Maps to the prototype's setup wizard (step 2 shown: family name, email, password — steps 1/3/4 can be simple "welcome"/"done" screens).
- `POST /auth/login` — validates email+password (scoped search across families by email since email should be unique per instance), sets `access_token` and `refresh_token` httpOnly cookies (short/long expiry).
- `POST /auth/refresh` — rotates access token using refresh cookie.
- `POST /auth/logout` — clears cookies.
- `get_current_user` dependency decodes the access token cookie, loads the User, attaches `family_id` and `role` to the request context.
- `require_editor` dependency raises 403 for readers on write endpoints.

### API endpoints
- `GET /documents?status=&tag=&q=` — list/search (readers see only `published`, editors see all)
- `GET /documents/{slug}`
- `POST /documents` (editor) — create draft
- `PUT /documents/{slug}` (editor) — update content/tags/status
- `DELETE /documents/{slug}` (editor)
- `GET /tags` — distinct tags + counts, for the "Browse by category" chips
- `GET /members`, `POST /members`, `PATCH /members/{id}`, `DELETE /members/{id}` (editor only) — manage family members/roles
- `POST /uploads` (editor) — multipart image upload, stored under `/data/uploads/{family_id}/...`, returns relative URL; `app/main.py` mounts `/uploads` as static
- Search: start with MongoDB text index on `title` + `content_md` + `tags` (`$text` search) — sufficient for a family-scale vault, matches the "highlighted match" search results screen (highlighting done client-side by matching the query string in returned snippets)

### Markdown → "steps"
The editor screen treats `## Step N: ...` headings as step boundaries (matches the prototype's textarea content). Backend stores raw markdown as-is; the frontend's `markdown-renderer` parses `##` headings into accordion steps for the Document view, and renders the full markdown normally in the editor preview pane. No special backend parsing needed initially — keep markdown handling client-side using `react-markdown` (or `remark`) plus a simple heading-splitter utility.

## Frontend design

### Routing & auth
- `middleware.ts` reads the `access_token` cookie. No cookie → redirect to `/login` (or `/setup` if backend reports no family exists yet — call a lightweight `GET /setup/status` endpoint). Authenticated users hitting `/login` or `/setup` get redirected to `/`.
- Route group `(auth)` = unauthenticated pages (login, setup wizard) — no shell/nav.
- Route group `(app)` = authenticated pages, wrapped in a shared layout containing the green header + bottom nav (mobile) per the prototype.

### Pages (mapped to reference screens)
- **Home** (`/`): green header with "Keeble" wordmark + avatar, search bar (links to `/search`), "Browse by category" tag chips (from `GET /tags`), "Recent guides" doc cards (from `GET /documents?status=published`), FAB (`+`) → `/docs/new` (editor only, hidden for readers)
- **Document view** (`/docs/[slug]`): green header with back link + title + tag chips, accordion steps parsed from markdown, "Mark as done ✓" buttons are client-side UI state only (no persistence needed initially)
- **Search** (`/search`): search input, results list with highlighted snippets (`GET /documents?q=`)
- **Tags** (`/tags`, `/tags/[tag]`): browse documents by category
- **Profile** (`/profile`): current user info, logout, family member management (editor only)
- **Setup wizard** (`/setup`): multi-step form (progress dots) — step "Create your account" creates Family + admin via `POST /setup`
- **Desktop editor** (`/docs/[slug]/edit`, `/docs/new`): sidebar (title, slug, tags, image drop-zone using `/uploads`), split markdown textarea + live preview, Save button → `PUT/POST /documents`

### Theming
`tailwind.config.ts` defines custom colors (`forest`, `leaf`, `mist`, `parchment`, `amber`, `rust`, `slate`, `stone`) and border-radius scale (`sm: 8px, md: 12px, lg: 16px, pill: 9999px`) matching `reference/keeble_color_scheme.html`. `globals.css` imports DM Sans + Lora from Google Fonts and sets them as `font-sans` / `font-display`. shadcn/ui components (button, input, badge, accordion, dialog, avatar) generated and restyled with these tokens.

## Dev tooling

- `mise.toml`: pins `python = "3.13"`, `node = "lts"`
- Backend `pyproject.toml` via `uv init`/`uv add fastapi uvicorn beanie motor pydantic-settings passlib[bcrypt] python-jose[cryptography] python-multipart`
- Root `Taskfile.yml` delegates to `backend/Taskfile.yml` (`task be:dev`, `task be:test`, `task be:lint`) and `frontend/Taskfile.yml` (`task fe:dev`, `task fe:build`, `task fe:lint`), plus `task dev` (runs mongo via docker-compose.dev + both dev servers), `task docker:build`/`task docker:up`

## Docker / production

- `docker-compose.yml`:
  - `mongo` service (official `mongo` image, named volume for data)
  - `app` service: single multi-stage Dockerfile that builds the Next.js app (`output: "standalone"`) and the FastAPI app together; at runtime, FastAPI serves the API under `/api/*` and also serves the built Next.js standalone server as a reverse-proxied/co-located process — use a small process supervisor (`supervisord` or a shell script starting `uvicorn` and `node server.js` on different ports, with a lightweight nginx or Next.js rewrite config so port 80 routes `/api` to FastAPI and everything else to Next.js). Recommendation: run Next.js on its port and FastAPI on another, with **Next.js `rewrites()`** proxying `/api/:path*` to the FastAPI port — avoids needing nginx, only needs a 2-process supervisor (use `supervisord`, simplest to configure).
  - Volumes: `mongo_data:/data/db`, `uploads:/data/uploads` (shared mount for FastAPI uploads, also accessible if needed)
  - Env vars: `MONGO_URI`, `JWT_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `COOKIE_SECURE`, `NEXT_PUBLIC_*` as needed at build time

## Implementation phases

1. **Scaffolding**: mise.toml, root Taskfile, backend `uv` project skeleton + FastAPI hello-world, frontend `create-next-app` with TS/Tailwind/shadcn, Tailwind theme tokens, basic docker-compose with mongo only — verify `task be:dev` and `task fe:dev` run and talk to a local mongo.
2. **Backend models + auth**: Family/User/Document Beanie models, password hashing, JWT issuance, `/setup`, `/auth/*`, `get_current_user`/`require_editor` deps — verify via `curl`/HTTP test against a running backend + mongo.
3. **Document API**: CRUD, tags, search (text index), uploads endpoint — verify with `curl` covering reader vs editor permissions and family scoping (create 2 families, confirm isolation).
4. **Frontend shell + auth**: Tailwind theme, fonts, `(auth)` setup/login pages wired to backend, middleware redirect logic — verify by running setup wizard end-to-end in browser, landing on Home.
5. **Core pages**: Home, Document view (accordion from markdown), Search, Tags — verify by creating docs via editor, browsing as reader.
6. **Desktop editor**: markdown editor + live preview + image upload — verify by editing a doc and seeing changes reflected in the document view.
7. **Profile / member management**: invite/manage family members, roles — verify role enforcement (reader cannot see edit UI / hits 403 if it tries the API directly).
8. **Polish & docker**: finalize Dockerfile (multi-stage, supervisord), full docker-compose with both services, smoke-test `docker compose up` end-to-end.

## Verification approach
- Backend: `task be:test` (pytest against an ephemeral mongo, e.g. via `mongomock`-free integration tests using a test DB) plus manual `curl`/httpie checks for auth cookies and role enforcement.
- Frontend: `task fe:dev` against the running backend; manually walk through setup → login → home → create doc → view doc → search → logout, on a mobile viewport (devtools responsive mode) to match the mobile-first reference screens.
- End-to-end: `docker compose up`, then run the same manual walkthrough against the production build.
