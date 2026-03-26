# Keeble — Development Tasks

Design is complete (`design/`, `keeble_prototype.html`). This document tracks implementation from bootstrap to production-ready Docker image.

---

## Phase 0 — Project Bootstrap

Stand up the monorepo skeleton so both services can run locally.

- [x] Create `web/` directory; init Next.js 14 App Router project with TypeScript strict mode (`npx create-next-app@latest`)
- [x] Install core dependencies: `@mantine/core`, `@mantine/hooks`, `next-intl`, `pocketbase`, `gray-matter`, `remark`, `remark-html`
- [x] Configure ESLint + Prettier; add `npm run lint` script
- [x] Add `.env.example` with `POCKETBASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_SECRET`
- [x] Download PocketBase binary into `pocketbase/` directory; verify `./pocketbase serve` works
- [x] Add root-level `README.md` with dev setup instructions (clone → PB serve → next dev → /setup)
- [x] Set up Mantine provider in `web/src/app/layout.tsx` with Keeble theme tokens (Forest, Leaf, Parchment, Slate, Amber palette; Lora + DM Sans fonts)
- [x] Configure `next-intl` with `en` locale as default; add `en.json` with placeholder keys

---

## Phase 1 — PocketBase Data Layer

Define all collections and wire up the client singleton.

- [x] Write migration `pb_migrations/1_collections.js` creating `documents`, `tags`, `settings` collections with all fields from the data model in CLAUDE.md
- [x] Configure `documents` API rules: authenticated users can read/write; unauthenticated users read-only (for family members without accounts)
- [x] Configure `tags` API rules: any authenticated user can read; only admin can write
- [x] Create `settings` collection as a singleton (one record, no list endpoint needed for clients)
- [x] Seed migration `pb_migrations/2_seed.js`: insert default `settings` record (`setup_completed: false`, `default_locale: en`, `app_name: Keeble`)
- [x] Write `web/src/lib/pb.ts`: PocketBase client singleton (SSR-safe, reads `POCKETBASE_URL` env var)
- [x] Write `web/src/types/index.ts`: TypeScript types for `Document`, `Tag`, `Settings` matching PocketBase schema
- [x] Write `web/src/lib/hooks/useDocs.ts` and `useAuth.ts` client hooks (PocketBase realtime subscription for useDocs)
- [x] Write `web/src/lib/markdown.ts`: `parseDoc()` (markdown → HTML via remark) and `serializeDoc()` (fields → markdown with frontmatter via gray-matter)

---

## Phase 2 — Authentication & Setup Wizard

Guard the app until setup is complete; then enforce login.

- [x] Write `web/src/middleware.ts`: check `settings.setup_completed`; if false and path ≠ `/setup`, redirect to `/setup`; if true and unauthenticated and path is protected, redirect to `/login`
- [x] Build `/setup` route (`web/src/app/setup/`) — 4-step wizard matching the design:
  - [x] Step 1: Welcome screen (app name, tagline, "Get started" CTA)
  - [x] Step 2: Create admin account (family name, email, password form → PocketBase admin creation)
  - [x] Step 3: Set locale + family name (dropdown from `en/fr/de/es`)
  - [x] Step 4: Import starter documents (optional drag-and-drop `.md` files) + "Finish setup" → sets `setup_completed: true`, redirects to `/`
- [x] Build `/login` page: email + password form → PocketBase `authWithPassword`; redirect to `/` on success
- [x] Add logout action (clears PocketBase auth store; redirects to `/login`)
- [x] Add `web/src/lib/i18n/en.json`, `fr.json`, `de.json`, `es.json` with all user-facing string keys

---

## Phase 3 — Mobile Shell & Navigation

Shared layout and bottom navigation bar for all authenticated routes.

- [ ] Build `web/src/components/layout/AppShell.tsx`: wraps all `(app)` routes; renders `BottomNav` on mobile, sidebar nav on desktop (`md` breakpoint)
- [ ] Build `web/src/components/layout/BottomNav.tsx`: Home / Search / Tags / Profile icons; active state via `usePathname`; min 48 px tap targets; labels translated via `t()`
- [ ] Build `web/src/components/layout/Header.tsx`: green header band with wordmark (Lora) + avatar button; accepts optional `children` slot for search bar or back navigation
- [ ] Create `web/src/app/(app)/layout.tsx`: uses `AppShell`; checks auth via middleware (already handled); passes locale to `next-intl`

---

## Phase 4 — Home Screen

`/` — browse categories and recent guides.

- [ ] Build `web/src/app/(app)/page.tsx` (Server Component): fetch recent 10 documents + all tags from PocketBase; pass to client components
- [ ] Build `web/src/components/search/SearchBar.tsx`: controlled input with 300 ms debounce; on mobile renders in the green header; navigates to `/search?q=…` on submit
- [ ] Build `web/src/components/doc/DocCard.tsx`: white card with emoji icon slot, title, tag pill, relative timestamp; `href` → `/doc/[id]`
- [ ] Build `web/src/components/ui/TagPill.tsx`: reusable pill; `variant` prop for `green | amber | slate`; maps to design tokens
- [ ] Build `web/src/components/layout/TagRow.tsx`: horizontal scrollable tag pills for category browsing; click filters docs client-side
- [ ] Add FAB (`+` button, amber) that navigates to `/edit/new`; hidden on desktop (editor accessible via sidebar)

---

## Phase 5 — Document Viewer

`/doc/[id]` — mobile-first step-by-step reader.

- [ ] Build `web/src/app/(app)/doc/[id]/page.tsx` (Server Component): fetch document by ID; parse markdown body into steps (split on `## Step N:` headings); pass to `DocViewer`
- [ ] Build `web/src/components/doc/DocViewer.tsx` (Client Component): renders `StepAccordion` list; tracks completed steps in local state
- [ ] Build `web/src/components/doc/StepAccordion.tsx`: collapsible step item; numbered circle (forest green); smooth max-height CSS transition; "Mark as done" button advances to next step; completed steps get ✓ and faded style
- [ ] Build `web/src/components/doc/ImageLightbox.tsx`: full-screen image overlay; tap anywhere to close; images sourced from PocketBase file URLs
- [ ] Add document header: `← Back` link, title, tag pills (ghost style on green background)
- [ ] Add `revalidatePath('/doc/[id]')` in any mutation that updates a document

---

## Phase 6 — Search

`/search` — full-text search with highlighted results.

- [ ] Build `web/src/app/(app)/search/page.tsx` (Server Component for initial render with `?q=` param)
- [ ] Build `web/src/lib/hooks/useSearch.ts`: calls PocketBase filter API (`title ~ "{q}" || body ~ "{q}" || tags.name ~ "{q}"`); 300 ms debounce; returns ranked results (title match first)
- [ ] Build `web/src/components/search/SearchResults.tsx`: list of `ResultCard` components; shows match count
- [ ] Build `web/src/components/search/ResultCard.tsx`: title with highlighted match (wrap matched substring in `<mark>`), snippet with highlight, tag pills
- [ ] Handle empty state (no results) and loading skeleton

---

## Phase 7 — Tags Browser

`/tags` — browse all categories.

- [ ] Build `web/src/app/(app)/tags/page.tsx`: grid of all tags with document count; click → `/tags/[name]`
- [ ] Build `web/src/app/(app)/tags/[name]/page.tsx`: filtered document list for one tag

---

## Phase 8 — Desktop Editor

`/edit/[id]` and `/edit/new` — markdown editor for desktop.

- [ ] Build `web/src/app/(app)/edit/[id]/page.tsx` (Client Component entry): load document, pass to `DocEditor`
- [ ] Build `web/src/components/doc/DocEditor.tsx`: two-column layout (editor left, preview right); hidden on mobile (redirect to viewer)
- [ ] Build editor left pane: `<textarea>` with monospace font; live-syncs to preview on change; tab key inserts 2 spaces
- [ ] Build preview right pane: renders parsed markdown via `parseDoc()`; large decorative Lora step numbers (matching prototype); image placeholders for not-yet-uploaded files
- [ ] Build `web/src/components/doc/FrontmatterSidebar.tsx`: title input, slug input (auto-generated from title, editable), tag multi-select (add/remove `TagPill`), image upload drop zone
- [ ] Implement image upload: drag-and-drop onto drop zone or click → file picker → upload to PocketBase `documents.images`; insert `![alt](url)` at cursor position in textarea
- [ ] Wire save: `PATCH /api/collections/documents/records/[id]` via `pb.collection('documents').update()`; `revalidatePath` on success; show save confirmation toast
- [ ] Wire create new: `POST` to PocketBase; redirect to `/edit/[newId]` after creation
- [ ] Add delete document action with confirmation dialog

---

## Phase 9 — Docker Packaging

Single-image deployment.

- [ ] Write `Dockerfile` (3-stage: `web-builder` → `pb-downloader` → final `node:20-alpine` with `supervisord`)
- [ ] Write `supervisord.conf`: manage both `pocketbase serve` and `node server.js` processes; restart on failure
- [ ] Write `docker-compose.yml`: `keeble` service, port mapping `3000:3000`, `pb_data` named volume, env vars
- [ ] Configure Next.js for standalone output (`output: 'standalone'` in `next.config.ts`) to minimise image size
- [ ] Verify full build: `docker compose up --build`; run through `/setup` wizard end-to-end in the container
- [ ] Add `.dockerignore` excluding `node_modules`, `.next`, `.git`, `design/`, `*.html` prototype files

---

## Phase 10 — Testing & Polish

- [ ] **Unit tests (Vitest)**: `markdown.ts` parse/serialize roundtrip; `useSearch` debounce logic; `TagPill` variant rendering
- [ ] **Component tests (RTL)**: `StepAccordion` expand/collapse/complete flow; `SearchBar` debounce; `DocCard` renders correct href
- [ ] **E2E — mobile (Playwright, 390 × 844 viewport)**: full flow: home → tap card → read all steps → mark all done; search "router" → tap result → view doc
- [ ] **E2E — desktop (Playwright, 1440 × 900)**: create new document → fill frontmatter → write markdown → upload image → save → verify in home list
- [ ] **Accessibility audit**: run `axe` on all 4 main views; fix any WCAG 2.1 AA failures; verify keyboard navigation on desktop editor
- [ ] **i18n completeness**: verify all `t()` keys exist in `en.json`; add French (`fr.json`) translations
- [ ] **Performance**: check Lighthouse mobile score ≥ 90; lazy-load images in `DocViewer`; add `loading="lazy"` to all `<img>`

---

## Backlog (post-MVP)

- PWA manifest + service worker for offline reading
- QR code generation per document (for printing and sticking on appliances)
- Role-based access: read-only family member accounts vs. admin
- Document version history
- AI-assisted document creation
