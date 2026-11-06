// The TV Menu box under the app list. Reached by pressing Down past the last
// app; Up returns to the list, Enter opens Samsung's own home bar, whose first
// tile is Source. (A sideloaded app can't open the Sources menu directly: the
// TV's remote-control service rejects apps via its self-signed certificate,
// and its Sources app doesn't respond to app launches.)
window.HomeInputs = (function () {
    var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_ENTER = 13;
    var HOME_BAR_APP = 'org.volt.firstscreen';
    // A grid of tiles, for the TV's menu of apps and sources.
    var ICON = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">' +
        '<rect x="8" y="8" width="13" height="13" rx="3"/><rect x="27" y="8" width="13" height="13" rx="3"/>' +
        '<rect x="8" y="27" width="13" height="13" rx="3"/><rect x="27" y="27" width="13" height="13" rx="3"/></svg>';

    var row, box, focused = false, onLeave;

    function render() {
        box.className = focused ? 'input-box is-active' : 'input-box';
        row.className = focused ? 'inputs is-focused' : 'inputs';
    }

    function say(text) {
        var el = document.getElementById('status');
        el.textContent = text;
        el.classList.add('is-showing');
        clearTimeout(say.t);
        say.t = setTimeout(function () { el.classList.remove('is-showing'); }, 6000);
    }

    function openHomeBar() {
        if (!window.tizen || !tizen.application) { say('Preview only: this would open Samsung\'s home bar'); return; }
        try {
            tizen.application.launch(HOME_BAR_APP, function () {}, function (e) {
                say('Could not open the TV\'s home bar (' + e.name + '). Press Source on the remote.');
            });
        } catch (e) {
            say('Could not open the TV\'s home bar. Press Source on the remote.');
        }
    }

    function onKey(event) {
        if (!focused) { return; }
        if (window.HomeSettings && window.HomeSettings.isOpen()) { return; }
        var handled = true;
        switch (event.keyCode) {
            case KEY_UP:
                focused = false;
                render();
                onLeave();
                if (window.HomeSound) { window.HomeSound.play('move'); }
                break;
            case KEY_ENTER:
                if (window.HomeSound) { window.HomeSound.play('select'); }
                openHomeBar();
                break;
            case KEY_LEFT: case KEY_RIGHT: break; // a single box: nothing to move to
            default: handled = false;
        }
        if (handled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    return {
        start: function (leaveHandler) {
            onLeave = leaveHandler;
            row = document.getElementById('inputs');
            row.innerHTML = '<div class="input-box"><span class="input-icon">' + ICON +
                '</span><span class="input-label">TV Menu</span></div>';
            box = row.firstChild;
            // Capture phase, so this runs before the list's handler.
            document.addEventListener('keydown', onKey, true);
            render();
        },
        focus: function () { focused = true; render(); },
        isFocused: function () { return focused; },
        isWatching: function () { return false; }
    };
}());
