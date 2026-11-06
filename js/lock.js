// Private mode: typing the code on the remote's number keys hides the apps listed
// in the local config (privateHide) and locks settings; typing it again restores them. Saved, so it survives a restart.
// Gives only a quiet sound as confirmation, so nothing on screen draws attention.
window.HomeLock = (function () {
    // The code comes from the local config (tvs.json -> local.privateCode), so it
    // is never published. With no code configured, private mode is off.
    var CODE = (window.HOME_LOCAL && window.HOME_LOCAL.privateCode) || '';
    var WINDOW_MS = 4000;      // digits must be typed within this time
    var typed = '', lastAt = 0, onChange;

    function digitFrom(event) {
        var k = event.keyCode;
        if (k >= 48 && k <= 57) { return String(k - 48); }
        if (k >= 96 && k <= 105) { return String(k - 96); }
        return null;
    }

    function isPrivate() {
        return !!(window.HomeConfig && window.HomeConfig.getOpt('private', false));
    }

    function toggle() {
        var next = !isPrivate();
        window.HomeConfig.setOpt('private', next);
        if (window.HomeSound) {
            window.HomeSound.play('move');
            setTimeout(function () { window.HomeSound.play(next ? 'move' : 'select'); }, 140);
        }
        onChange(next);
    }

    function onKey(event) {
        var d = digitFrom(event);
        if (d === null || !CODE) { return; }
        if (window.HomeSettings && window.HomeSettings.isOpen()) { return; } // let the postcode field have digits
        var now = Date.now();
        if (now - lastAt > WINDOW_MS) { typed = ''; }
        lastAt = now;
        typed = (typed + d).slice(-CODE.length);
        if (typed === CODE) {
            typed = '';
            toggle();
        }
        event.preventDefault();
    }

    return {
        start: function (changeHandler) {
            onChange = changeHandler;
            // The TV only delivers number keys to apps that ask for them.
            try {
                if (window.tizen && tizen.tvinputdevice) {
                    for (var i = 0; i <= 9; i++) { tizen.tvinputdevice.registerKey(String(i)); }
                }
            } catch (e) { /* number keys unavailable */ }
            document.addEventListener('keydown', onKey);
        },
        isPrivate: isPrivate
    };
}());
