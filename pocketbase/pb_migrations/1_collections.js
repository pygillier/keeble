/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // ── 1. tags ────────────────────────────────────────────────────────────────
    const tags = new Collection({
      name: "tags",
      type: "base",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          min: 1,
        },
        {
          name: "color",
          type: "text",
          required: false,
          max: 7,
          pattern: "^#[0-9A-Fa-f]{6}$",
        },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_tags_name ON tags (name)"],
      // Any visitor can read; only admin can write (null = admin-only)
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    app.save(tags);

    // ── 2. documents ───────────────────────────────────────────────────────────
    const documents = new Collection({
      name: "documents",
      type: "base",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          min: 1,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          min: 1,
        },
        {
          name: "body",
          type: "text",
          required: false,
        },
        {
          name: "tags",
          type: "relation",
          required: false,
          collectionId: tags.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
        },
        {
          name: "images",
          type: "file",
          required: false,
          maxSelect: 10,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          thumbs: ["400x0"],
        },
        {
          name: "author",
          type: "relation",
          required: false,
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
        },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_documents_slug ON documents (slug)"],
      // Unauthenticated users can read; authenticated users can write
      listRule: "",
      viewRule: "",
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    });
    app.save(documents);

    // ── 3. settings (singleton) ────────────────────────────────────────────────
    const settings = new Collection({
      name: "settings",
      type: "base",
      fields: [
        {
          name: "app_name",
          type: "text",
          required: true,
          min: 1,
        },
        {
          name: "default_locale",
          type: "text",
          required: true,
          min: 2,
          max: 10,
        },
        {
          name: "allow_registration",
          type: "bool",
          required: false,
        },
        {
          name: "setup_completed",
          type: "bool",
          required: false,
        },
      ],
      indexes: [],
      // No list endpoint for clients; single record accessible by ID
      listRule: null,
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    app.save(settings);
  },
  (app) => {
    // Down: remove all three collections in reverse dependency order
    for (const name of ["documents", "tags", "settings"]) {
      try {
        const col = app.findCollectionByNameOrId(name);
        app.delete(col);
      } catch (_) {
        // collection may not exist — ignore
      }
    }
  },
);
