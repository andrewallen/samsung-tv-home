// Opens the chosen app, and shows a short status line if it can't.
window.HomeLauncher = (function () {
    var statusEl, statusTimer;

    function say(text) {
        statusEl = statusEl || document.getElementById('status');
        statusEl.textContent = text;
        statusEl.classList.add('is-showing');
        clearTimeout(statusTimer);
        statusTimer = setTimeout(function () {
            statusEl.classList.remove('is-showing');
        }, 6000);
    }

    function failed(app) {
        say(app.hint || (app.name + " couldn't open. Open it from Samsung's Home menu."));
    }

    // Second route: ask the TV's own local service to open the app.
    // The response can't be read cross-origin, so a network error is the only failure signal.
    function openThroughTv(app, launchId) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:8001/api/v2/applications/' + launchId);
        xhr.onerror = function () { failed(app); };
        xhr.send();
    }

    function open(app) {
        var launchId = app.launchId || app.id;
        if (!window.tizen || !window.tizen.application) {
            say('Preview only: this would open ' + app.name);
            return;
        }
        try {
            window.tizen.application.launch(launchId, null, function () {
                // Launch rejected: for a normal app try the local service, else show the hint.
                if (app.launchId) { failed(app); } else { openThroughTv(app, launchId); }
            });
        } catch (e) {
            if (app.launchId) { failed(app); } else { openThroughTv(app, launchId); }
        }
    }

    return { open: open };
}());
