/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("settings");

    const record = new Record(collection, {
      app_name: "Keeble",
      default_locale: "en",
      allow_registration: false,
      setup_completed: false,
    });
    app.save(record);
  },
  (app) => {
    app.db().newQuery("DELETE FROM settings").execute();
  },
);
