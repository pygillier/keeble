/// <reference path="../pb_data/types.d.ts" />

// Custom endpoint called by the setup wizard to mark setup as complete.
// It is intentionally unauthenticated but only succeeds when setup_completed = false,
// preventing it from being used after the wizard has already run.
routerAdd("POST", "/api/keeble/complete-setup", (e) => {
    const body = e.requestInfo().body;

    let settings;
    try {
        settings = $app.findFirstRecordByFilter("settings", "setup_completed = false");
    } catch (_) {
        return e.json(400, { "error": "Setup already completed or settings not found" });
    }

    if (!settings) {
        return e.json(400, { "error": "Setup already completed" });
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
        return e.json(500, { "error": "Failed to save settings: " + String(err) });
    }

    return e.json(200, { "success": true });
});
