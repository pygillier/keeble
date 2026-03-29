/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // Make settings publicly listable so the Next.js middleware can check
    // setup_completed without admin credentials on every request.
    // Settings only contains non-sensitive config (app_name, locale, setup_completed).
    const col = app.findCollectionByNameOrId("settings");
    col.listRule = ""; // public read
    app.save(col);
  },
  (app) => {
    const col = app.findCollectionByNameOrId("settings");
    col.listRule = null; // revert to admin-only
    app.save(col);
  },
);
