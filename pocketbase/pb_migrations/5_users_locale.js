/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId("users");
    usersCol.fields.add(
      new TextField({
        name: "locale",
        required: false,
        max: 10,
      }),
    );
    app.save(usersCol);
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId("users");
    usersCol.fields.removeByName("locale");
    app.save(usersCol);
  },
);
