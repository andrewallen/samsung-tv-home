// A vertical app list with a glass highlight that glides to the selected item.
window.HomeList = (function () {
    var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_DOWN = 40, KEY_ENTER = 13, KEY_RETURN = 10009;
    var ITEM_H = 142;

    var container, pill, items = [], apps = [], idx = 0, onSelect, onSettings;

    function escapeText(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var away = false;

    function render() {
        container.className = away ? 'applist is-away' : 'applist';
        var move = 'translate3d(0, ' + (idx * ITEM_H) + 'px, 0)';
        pill.style.webkitTransform = move;
        pill.style.transform = move;
        for (var i = 0; i < items.length; i++) {
            items[i].className = i === idx && !away ? 'app-item is-active' : 'app-item';
        }
    }

    function build() {
        apps = window.HomeConfig.getApps();
        if (idx >= apps.length) { idx = Math.max(0, apps.length - 1); }
        var html = '<div class="pill"></div>';
        apps.forEach(function (app, i) {
            html += '<div class="app-item" style="top:' + (i * ITEM_H) + 'px">' +
                '<span class="app-item-icon icon-' + app.icon + '">' + window.homeGlyph(app.icon) + '</span>' +
                '<span class="app-item-name">' + escapeText(app.name) + '</span>' +
                '</div>';
        });
        container.innerHTML = html;
        pill = container.firstChild;
        items = Array.prototype.slice.call(container.children, 1);
        pill.style.display = apps.length ? '' : 'none';
        render();
    }

    function move(step) {
        var next = idx + step;
        // Down past the last app goes to the HDMI input boxes.
        if (step > 0 && next >= items.length && window.HomeInputs) {
            away = true;
            render();
            window.HomeInputs.focus();
            if (window.HomeSound) { window.HomeSound.play('move'); }
            return;
        }
        if (next >= 0 && next < items.length) {
            idx = next;
            render();
            if (window.HomeSound) { window.HomeSound.play('move'); }
        }
    }

    function onKey(event) {
        if (window.HomeSettings && window.HomeSettings.isOpen()) { return; }
        if (window.HomeInputs && window.HomeInputs.isWatching()) { return; }
        if (window.HomeInputs && window.HomeInputs.isFocused() && event.keyCode !== KEY_RETURN) { return; }
        var handled = true;
        switch (event.keyCode) {
            case KEY_UP:    move(-1); break;
            case KEY_DOWN:  move(1);  break;
            case KEY_LEFT:  if (window.HomeScene) { window.HomeScene.explore(-1); } break;
            case KEY_RIGHT: if (window.HomeScene) { window.HomeScene.explore(1); } break;
            case KEY_ENTER: if (apps[idx]) { if (window.HomeSound) { window.HomeSound.play('select'); } onSelect(apps[idx]); } break;
            case KEY_RETURN: if (onSettings && !(window.HomeLock && window.HomeLock.isPrivate())) { onSettings(); } break;
            default: handled = false;
        }
        if (handled) { event.preventDefault(); }
    }

    return {
        build: function (el, selectHandler, settingsHandler) {
            container = el;
            onSelect = selectHandler;
            onSettings = settingsHandler;
            build();
            // Start on the configured app when it's shown; otherwise the first app.
            var start = window.HOME_LOCAL && window.HOME_LOCAL.startApp;
            for (var i = 0; start && i < apps.length; i++) {
                if (apps[i].id === start) { idx = i; render(); break; }
            }
            document.addEventListener('keydown', onKey);
        },
        rebuild: build,
        comeBack: function () { away = false; render(); }
    };
}());
