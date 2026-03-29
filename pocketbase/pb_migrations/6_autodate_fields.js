/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    for (const name of ['documents', 'tags', 'settings']) {
      const col = app.findCollectionByNameOrId(name);

      col.fields.add(
        new AutodateField({
          name: 'created',
          onCreate: true,
          onUpdate: false,
        }),
      );

      col.fields.add(
        new AutodateField({
          name: 'updated',
          onCreate: true,
          onUpdate: true,
        }),
      );

      app.save(col);
    }
  },
  (app) => {
    for (const name of ['documents', 'tags', 'settings']) {
      const col = app.findCollectionByNameOrId(name);
      for (const fname of ['created', 'updated']) {
        const field = col.fields.getByName(fname);
        if (field) col.fields.remove(field);
      }
      app.save(col);
    }
  },
);
