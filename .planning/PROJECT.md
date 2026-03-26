# Keeble

## What This Is

Keeble is a self-hosted family documentation vault. It lets non-technical family members — including children — find and follow step-by-step guides on a mobile phone (e.g. "reboot the router", "change the washing machine filter"). A desktop view is provided for the author to write and manage guides. There is one author; the rest of the family only reads.

## Core Value

A 10-year-old can fix a real house problem without calling dad.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Mobile-first reader: large tap targets, big text, step-by-step layout easy enough for a child
- [ ] Full-text search so family can find the right guide fast under stress
- [ ] Browse by tag/category (appliances, network, etc.)
- [ ] Single admin can write and publish guides in Markdown
- [ ] Media support: images embedded in guides to show what to do
- [ ] Self-hosted via Docker: runs on a home server, accessible on the local network
- [ ] /setup onboarding wizard for first-time installation
- [ ] Authentication: family members log in; single admin account for authoring
- [ ] Localisation support (en, fr, de, es) — family may not be English-first

### Out of Scope

- Multi-author / collaborative editing — only the dad writes guides; family reads
- Offline PWA / service worker cache — adds complexity, not needed for v1
- QR codes per document — useful but v2 feature
- Document versioning / history — out of scope for v1
- Role-based access beyond admin/reader — not needed for this family size
- AI-assisted document creation — future idea, not v1

## Context

- **User:** Developer and family head who travels for work; needs family to be self-sufficient
- **Readers:** Partner and children (youngest ~10-14), accessing on mobile during stressful moments
- **Author:** Only one person writes guides — a single admin with full desktop editor
- **Problem replaced:** Phone calls home to walk family through fixes step by step
- **Content types:** Mix of appliance guides (washing machine, oven, filters) and tech guides (router, WiFi, TV)
- **Success signal:** Family solves one real problem without calling — that's the proof it works

## Constraints

- **Tech stack**: Next.js 14 (App Router) + Mantine UI v7 + PocketBase (embedded SQLite) — architecture already decided
- **Deployment**: Single Docker image (both Next.js and PocketBase via supervisord) — must be simple for self-hosting
- **Readers**: Must work on mobile for a stressed 10-year-old — UX cannot require tech knowledge
- **Author only**: No collaborative editing needed — one admin, simplify accordingly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PocketBase as backend | Embedded SQLite, single binary, easy self-hosting — no separate DB setup | — Pending |
| Next.js App Router | SSR for fast mobile loads, good DX for the author dashboard | — Pending |
| Mantine UI v7 | Component library with good mobile defaults, accessible out of the box | — Pending |
| Single Docker image | Simplest deployment story for non-devs self-hosting at home | — Pending |
| Single author model | Family only reads; no collaborative editing needed for v1 | — Pending |

---
*Last updated: 2026-03-26 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
