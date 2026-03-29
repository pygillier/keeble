/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // ── 1. Add is_admin bool to users ─────────────────────────────────────────
    const usersCol = app.findCollectionByNameOrId("users");
    usersCol.fields.add(
      new BoolField({
        name: "is_admin",
        required: false,
      }),
    );
    app.save(usersCol);

    // ── 2. Tighten documents write rules to admins only ────────────────────────
    const docsCol = app.findCollectionByNameOrId("documents");
    const adminRule = '@request.auth.id != "" && @request.auth.is_admin = true';
    docsCol.createRule = adminRule;
    docsCol.updateRule = adminRule;
    docsCol.deleteRule = adminRule;
    app.save(docsCol);

    // ── 3. Tighten tags write rules to admins only ─────────────────────────────
    const tagsCol = app.findCollectionByNameOrId("tags");
    tagsCol.createRule = adminRule;
    tagsCol.updateRule = adminRule;
    tagsCol.deleteRule = adminRule;
    app.save(tagsCol);
  },
  (app) => {
    // Revert users
    const usersCol = app.findCollectionByNameOrId("users");
    usersCol.fields.removeByName("is_admin");
    app.save(usersCol);

    // Revert documents write rules
    const docsCol = app.findCollectionByNameOrId("documents");
    const authOnly = '@request.auth.id != ""';
    docsCol.createRule = authOnly;
    docsCol.updateRule = authOnly;
    docsCol.deleteRule = authOnly;
    app.save(docsCol);

    // Revert tags write rules (originally admin-only with null)
    const tagsCol = app.findCollectionByNameOrId("tags");
    tagsCol.createRule = null;
    tagsCol.updateRule = null;
    tagsCol.deleteRule = null;
    app.save(tagsCol);
  },
);
