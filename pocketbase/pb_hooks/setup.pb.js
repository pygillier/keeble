/// <reference path="../pb_data/types.d.ts" />

// Custom endpoint called by the setup wizard to mark setup as complete.
// It is intentionally unauthenticated but only succeeds when setup_completed = false,
// preventing it from being used after the wizard has already run.
routerAdd("POST", "/api/keeble/complete-setup", (c) => {
    const body = {};
    c.bind(body);

    const dao = $app.dao();

    let settings;
    try {
        settings = dao.findFirstRecordByFilter("settings", "setup_completed = false");
    } catch (_) {
        return c.json(400, { "error": "Setup already completed or settings not found" });
    }

    if (!settings) {
        return c.json(400, { "error": "Setup already completed" });
    }

    if (body.app_name) {
        settings.set("app_name", body.app_name);
    }
    if (body.default_locale) {
        settings.set("default_locale", body.default_locale);
    }
    settings.set("setup_completed", true);

    try {
        dao.saveRecord(settings);
    } catch (e) {
        return c.json(500, { "error": "Failed to save settings: " + String(e) });
    }

    return c.json(200, { "success": true });
});
