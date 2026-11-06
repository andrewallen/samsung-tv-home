// Saved settings: the forecast location, plus the app order and which apps are
// hidden. Stored in localStorage, so it survives restarts but is cleared if the
// app is uninstalled. Wrapped in try/catch because storage can be unavailable.
window.HomeConfig = (function () {
    var KEY = 'home.config.v1';
    var LOCAL = window.HOME_LOCAL || {};
    // Default forecast location: from the local config, else central London.
    var DEFAULT_PLACE = LOCAL.place || { name: 'London', latitude: 51.5074, longitude: -0.1278 };

    var state = (function () {
        try {
            var s = window.localStorage.getItem(KEY);
            if (s) { return JSON.parse(s); }
        } catch (e) { /* storage unavailable */ }
        return {};
    }());

    function save() {
        try {
            window.localStorage.setItem(KEY, JSON.stringify(state));
        } catch (e) { /* storage unavailable */ }
    }

    function ordered() {
        var all = window.HOME_APPS.slice();
        if (state.order) {
            all.sort(function (a, b) {
                var ia = state.order.indexOf(a.id);
                var ib = state.order.indexOf(b.id);
                if (ia < 0) { ia = 999; }
                if (ib < 0) { ib = 999; }
                return ia - ib;
            });
        }
        return all;
    }

    return {
        getPlace: function () { return state.place || DEFAULT_PLACE; },
        setPlace: function (place) { state.place = place; save(); },

        // Visible apps, in order, for the home list.
        getApps: function () {
            var hidden = state.hidden || {};
            // Private mode hides these apps without touching the normal show/hide choices.
            var priv = state.opts && state.opts['private'] ? (LOCAL.privateHide || []) : [];
            return ordered().filter(function (a) { return !hidden[a.id] && priv.indexOf(a.id) < 0; });
        },
        // Every app, in order, for the settings screen.
        allApps: ordered,
        isHidden: function (id) { return !!(state.hidden && state.hidden[id]); },
        setHidden: function (id, value) {
            state.hidden = state.hidden || {};
            state.hidden[id] = value;
            save();
        },
        setOrder: function (ids) { state.order = ids; save(); },

        // Small display options, such as clock format or showing the weather.
        getOpt: function (key, fallback) {
            return state.opts && state.opts[key] !== undefined ? state.opts[key] : fallback;
        },
        setOpt: function (key, value) {
            state.opts = state.opts || {};
            state.opts[key] = value;
            save();
        }
    };
}());
