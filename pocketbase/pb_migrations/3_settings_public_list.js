/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    // Make settings publicly listable so the Next.js middleware can check
    // setup_completed without admin credentials on every request.
    // Settings only contains non-sensitive config (app_name, locale, setup_completed).
    const dao = new Dao(db);
    const col = dao.findCollectionByNameOrId("settings");
    col.listRule = ""; // public read
    dao.saveCollection(col);
  },
  (db) => {
    const dao = new Dao(db);
    const col = dao.findCollectionByNameOrId("settings");
    col.listRule = null; // revert to admin-only
    dao.saveCollection(col);
  },
);
