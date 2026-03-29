/// <reference path="../pb_data/types.d.ts" />

// Custom endpoint called by the setup wizard to mark setup as complete.
// It is intentionally unauthenticated but only succeeds when setup_completed = false,
// preventing it from being used after the wizard has already run.
routerAdd("POST", "/api/keeble/complete-setup", (e) => {
  const body = e.requestInfo().body;

  let settings;
  try {
    settings = $app.findFirstRecordByFilter(
      "settings",
      "setup_completed = false",
    );
  } catch (_) {
    return e.json(400, {
      error: "Setup already completed or settings not found",
    });
  }

  if (!settings) {
    return e.json(400, { error: "Setup already completed" });
  }

  if (body.app_name) {
    settings.set("app_name", body.app_name);
  }
  if (body.default_locale) {
    settings.set("default_locale", body.default_locale);
  }
  settings.set("setup_completed", true);

  try {
    $app.save(settings);
  } catch (err) {
    return e.json(500, { error: "Failed to save settings: " + String(err) });
  }

  // Grant admin role to all existing users (exactly one at setup time).
  try {
    const users = $app.findAllRecords("users");
    for (const user of users) {
      user.set("is_admin", true);
      $app.save(user);
    }
  } catch (err) {
    return e.json(500, { error: "Failed to assign admin role: " + String(err) });
  }

  return e.json(200, { success: true });
});

// Prevent unprivileged users from elevating their own is_admin flag via the API.
// onRecordUpdateRequest fires only for HTTP API requests, not for internal $app.save() calls,
// so setup and migration saves are unaffected.
onRecordUpdateRequest((e) => {
  const auth = e.auth;
  if (!auth || !auth.get("is_admin")) {
    // Restore is_admin to whatever is currently in the DB, ignoring any
    // value the client may have sent in the request body.
    try {
      const stored = $app.findRecordById("users", e.record.id);
      e.record.set("is_admin", stored.get("is_admin"));
    } catch (_) {}
  }
  return e.next();
}, "users");
