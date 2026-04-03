# Importing Documents

Keeble can import existing Markdown files, so you can bring in guides you already have.

## Supported Format

Keeble imports standard Markdown files (`.md`). Frontmatter is optional but supported:

```markdown
---
title: Reboot the Internet Router
tags: [network, router]
slug: reboot-router
---

Your content here…
```

If frontmatter is present, Keeble will:
- Use the `title` field as the document title
- Apply the listed `tags` (creating any that do not yet exist)
- Use the `slug` if provided, or generate one from the title

If no frontmatter is present, the filename is used as the title.

## How to Import

1. Open the editor (create a new document or open an existing one).
2. Click the **Import** button in the toolbar.
3. Select your `.md` file from your device.
4. Review the imported content in the preview pane.
5. Adjust the title, tags, or slug if needed.
6. Click **Save**.

## Bulk Import

For importing many files at once, use the PocketBase admin UI at `http://localhost:8090/_/` and upload records directly via the API. This is intended for administrators only.

## Example File

The [examples/](https://github.com/pygillier/keeble/tree/main/examples) directory in the repository contains sample Markdown files you can use as templates.
