/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const docsCol = app.findCollectionByNameOrId("documents");
    docsCol.fields.add(
      new TextField({
        name: "description",
        required: false,
      }),
    );
    app.save(docsCol);
  },
  (app) => {
    const docsCol = app.findCollectionByNameOrId("documents");
    docsCol.fields.removeByName("description");
    app.save(docsCol);
  },
);
