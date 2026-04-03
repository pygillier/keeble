/// <reference path="../pb_data/types.d.ts" />

// Nightly job (03:00) that removes images attached to a document but no longer
// referenced in its markdown body.  When a record is saved with fewer filenames
// in a file field, PocketBase automatically deletes the removed files from storage.
cronAdd("orphan-images-cleanup", "0 3 * * *", () => {
  let cleaned = 0;

  const docs = $app.findAllRecords("documents");
  for (const doc of docs) {
    const images = doc.get("images");
    if (!images || images.length === 0) continue;

    const body = doc.getString("body") ?? "";
    const docId = doc.id;

    const orphans = images.filter(
      (filename) =>
        // Check both the proxy URL (current) and the direct PocketBase URL (legacy)
        !body.includes(`/api/images/documents/${docId}/${filename}`) &&
        !body.includes(`/api/files/documents/${docId}/${filename}`),
    );

    if (orphans.length === 0) continue;

    const remaining = images.filter((f) => !orphans.includes(f));
    doc.set("images", remaining);
    $app.save(doc);
    cleaned += orphans.length;
  }

  if (cleaned > 0) {
    $app.logger().info("[orphan-images-cleanup] removed orphan images", "count", cleaned);
  }
});
