/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("settings");

    const record = new Record(collection, {
        app_name: "Keeble",
        default_locale: "en",
        allow_registration: false,
        setup_completed: false,
    });
    dao.saveRecord(record);

}, (db) => {
    db.newQuery("DELETE FROM settings").execute();
});
