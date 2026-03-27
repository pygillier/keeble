/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);

    // ── 1. tags ────────────────────────────────────────────────────────────────
    const tags = new Collection({
      name: "tags",
      type: "base",
      system: false,
      schema: [
        {
          name: "name",
          type: "text",
          required: true,
          unique: false,
          options: { min: 1, max: null, pattern: "" },
        },
        {
          name: "color",
          type: "text",
          required: false,
          unique: false,
          options: { min: null, max: 7, pattern: "^#[0-9A-Fa-f]{6}$" },
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
    dao.saveCollection(tags);

    // ── 2. documents ───────────────────────────────────────────────────────────
    const documents = new Collection({
      name: "documents",
      type: "base",
      system: false,
      schema: [
        {
          name: "title",
          type: "text",
          required: true,
          unique: false,
          options: { min: 1, max: null, pattern: "" },
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: false,
          options: { min: 1, max: null, pattern: "" },
        },
        {
          name: "body",
          type: "text",
          required: false,
          unique: false,
          options: { min: null, max: null, pattern: "" },
        },
        {
          name: "tags",
          type: "relation",
          required: false,
          unique: false,
          options: {
            collectionId: tags.id,
            cascadeDelete: false,
            minSelect: null,
            maxSelect: null,
            displayFields: ["name"],
          },
        },
        {
          name: "images",
          type: "file",
          required: false,
          unique: false,
          options: {
            maxSelect: 10,
            maxSize: 5242880,
            mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
            thumbs: ["400x0"],
            protected: false,
          },
        },
        {
          name: "author",
          type: "relation",
          required: false,
          unique: false,
          options: {
            collectionId: "_pb_users_auth_",
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: ["email"],
          },
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
    dao.saveCollection(documents);

    // ── 3. settings (singleton) ────────────────────────────────────────────────
    const settings = new Collection({
      name: "settings",
      type: "base",
      system: false,
      schema: [
        {
          name: "app_name",
          type: "text",
          required: true,
          unique: false,
          options: { min: 1, max: null, pattern: "" },
        },
        {
          name: "default_locale",
          type: "text",
          required: true,
          unique: false,
          options: { min: 2, max: 10, pattern: "" },
        },
        {
          name: "allow_registration",
          type: "bool",
          required: false,
          unique: false,
          options: {},
        },
        {
          name: "setup_completed",
          type: "bool",
          required: false,
          unique: false,
          options: {},
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
    dao.saveCollection(settings);
  },
  (db) => {
    // Down: remove all three collections in reverse dependency order
    const dao = new Dao(db);
    for (const name of ["documents", "tags", "settings"]) {
      try {
        const col = dao.findCollectionByNameOrId(name);
        dao.deleteCollection(col);
      } catch (_) {
        // collection may not exist — ignore
      }
    }
  },
);
