# Contributing

Contributions are welcome! Please read this page before opening a PR.

## Workflow

1. **Fork** the repository on GitHub.
2. Create a branch: `git checkout -b feat/my-feature` (or `fix/`, `docs/`, etc.)
3. Make your changes.
4. Run `npm run lint` and `npm test` — both must pass.
5. Open a **Pull Request** against `main` with a short description.

## Branch Naming

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Refactoring without behaviour change |
| `chore/` | Build, config, CI changes |

## Commit Messages

Use short, imperative-mood messages:

```
feat: add tag colour picker
fix: prevent empty slug on save
docs: update docker deployment guide
```

## Adding a Translation

1. Copy `web/src/lib/i18n/en.json` to a new file, e.g. `pt.json`.
2. Translate all string values (keep the keys unchanged).
3. Register the locale in `web/src/lib/i18n/index.ts`.
4. Open a PR — translations are always welcome!

## Testing

| Type | Tool | Command |
|---|---|---|
| Unit | Vitest | `npm test` |
| Component | React Testing Library | `npm test` |
| End-to-end | Playwright | `npm run test:e2e` |

E2E tests run against both mobile viewport (390×844) and desktop (1280×800).

## Reporting Bugs

Open an issue on [GitHub](https://github.com/pygillier/keeble/issues) with:
- Steps to reproduce
- Expected vs actual behaviour
- Browser and OS version
- Screenshots if relevant
