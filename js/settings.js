// An on-TV settings screen, opened with the Return key from the home list.
//  - Location: enter a UK postcode (the TV keyboard appears) to move the forecast.
//  - Each app: Enter shows or hides it; Left/Right moves it up or down the list.
// Changes apply immediately and are saved by HomeConfig.
window.HomeSettings = (function () {
    var KEY_UP = 38, KEY_DOWN = 40, KEY_LEFT = 37, KEY_RIGHT = 39, KEY_ENTER = 13, KEY_RETURN = 10009;

    var root, rowsEl, locInput, onChange;
    var open = false, editing = false, rowIdx = 0, rows = [];

    function escapeText(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var SCENE_NAMES = ['Pre-dawn', 'Sunrise', 'Morning', 'Midday', 'Golden hour', 'Sunset', 'Dusk', 'Night'];
    var OPTIONS = [
        { key: 'clock',    label: 'Clock',      def: '24',   values: [['24', '24-hour'], ['12', '12-hour']] },
        { key: 'date',     label: 'Date',       def: 'full', values: [['full', 'Full'], ['short', 'Short'], ['off', 'Off']] },
        { key: 'weather',  label: 'Weather',    def: 'on',   values: [['on', 'On'], ['off', 'Off']] },
        { key: 'forecast', label: 'Forecast',   def: 'on',   values: [['on', 'On'], ['off', 'Off']] },
        { key: 'scene',    label: 'Background', def: 'live', values: [['live', 'Follow the day']].concat(SCENE_NAMES.map(function (n, i) { return [String(i), n]; })) },
        { key: 'motion',   label: 'Motion',     def: 'full', values: [['full', 'Full'], ['calm', 'Calm']] },
        { key: 'sound',    label: 'Sounds',     def: 'on',   values: [['on', 'On'], ['off', 'Off']] }
    ];

    function optionLabel(o) {
        var v = window.HomeConfig.getOpt(o.key, o.def);
        for (var i = 0; i < o.values.length; i++) { if (o.values[i][0] === v) { return o.values[i][1]; } }
        return o.values[0][1];
    }

    function cycleOption(o, step) {
        if (window.HomeSound) { window.HomeSound.play('move'); }
        var v = window.HomeConfig.getOpt(o.key, o.def), at = 0;
        for (var i = 0; i < o.values.length; i++) { if (o.values[i][0] === v) { at = i; } }
        at = (at + step + o.values.length) % o.values.length;
        window.HomeConfig.setOpt(o.key, o.values[at][0]);
        renderRows();
        onChange();
    }

    function buildRows() {
        rows = [{ type: 'location' }];
        OPTIONS.forEach(function (o) { rows.push({ type: 'option', opt: o }); });
        window.HomeConfig.allApps().forEach(function (app) {
            rows.push({ type: 'app', id: app.id, name: app.name });
        });
    }

    function renderRows() {
        var html = '';
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var focused = i === rowIdx ? ' is-focused' : '';
            if (r.type === 'location') {
                html += '<div class="set-row' + focused + '">' +
                    '<span class="set-label">Location</span>' +
                    '<span class="set-value">' + escapeText(window.HomeConfig.getPlace().name) + '</span>' +
                    '</div>';
            } else if (r.type === 'option') {
                html += '<div class="set-row' + focused + '">' +
                    '<span class="set-label">' + r.opt.label + '</span>' +
                    '<span class="set-value is-choice">' + escapeText(optionLabel(r.opt)) + '</span>' +
                    '</div>';
            } else {
                if (i > 0 && rows[i - 1].type !== 'app') { html += '<div class="set-section">Apps</div>'; }
                var on = !window.HomeConfig.isHidden(r.id);
                html += '<div class="set-row' + focused + '">' +
                    '<span class="set-label">' + escapeText(r.name) + '</span>' +
                    '<span class="set-value' + (on ? ' is-on' : '') + '">' + (on ? 'Shown' : 'Hidden') + '</span>' +
                    '</div>';
            }
        }
        rowsEl.innerHTML = html;
    }

    function startEdit() {
        editing = true;
        locInput.value = '';
        locInput.className = 'set-input is-editing';
        locInput.focus();
    }

    function endEdit() {
        editing = false;
        locInput.className = 'set-input';
        locInput.blur();
    }

    function commitPostcode() {
        var value = locInput.value;
        if (!value) { endEdit(); return; }
        var valueEl = root.querySelector('.set-row .set-value');
        if (valueEl) { valueEl.textContent = 'Searching…'; }
        window.HomeWeather.geocode(value, function (found) {
            endEdit();
            if (found) {
                window.HomeConfig.setPlace(found);
                window.HomeWeather.reload();
            }
            renderRows();
            if (!found) {
                var v = root.querySelector('.set-row .set-value');
                if (v) { v.textContent = 'Not found'; }
            }
        });
    }

    function moveApp(step) {
        var r = rows[rowIdx];
        if (r.type !== 'app') { return; }
        var ids = window.HomeConfig.allApps().map(function (a) { return a.id; });
        var from = ids.indexOf(r.id);
        var to = from + step;
        if (to < 0 || to >= ids.length) { return; }
        ids.splice(to, 0, ids.splice(from, 1)[0]);
        window.HomeConfig.setOrder(ids);
        buildRows();
        // Follow the moved app (app rows come after location and the options).
        rowIdx = to + 1 + OPTIONS.length;
        renderRows();
        onChange();
    }

    function toggleApp() {
        var r = rows[rowIdx];
        if (r.type !== 'app') { return; }
        window.HomeConfig.setHidden(r.id, !window.HomeConfig.isHidden(r.id));
        renderRows();
        onChange();
    }

    function show() {
        open = true;
        buildRows();
        rowIdx = 0;
        renderRows();
        root.className = 'settings is-open';
    }

    function hide() {
        if (editing) { endEdit(); }
        open = false;
        root.className = 'settings';
    }

    function onKey(event) {
        if (!open) { return; }
        if (editing) {
            if (event.keyCode === KEY_ENTER) { commitPostcode(); event.preventDefault(); event.stopImmediatePropagation(); }
            else if (event.keyCode === KEY_RETURN) { endEdit(); renderRows(); event.preventDefault(); event.stopImmediatePropagation(); }
            return; // let other keys type into the field
        }
        var handled = true;
        switch (event.keyCode) {
            case KEY_UP:    if (rowIdx > 0) { rowIdx--; renderRows(); if (window.HomeSound) { window.HomeSound.play('move'); } } break;
            case KEY_DOWN:  if (rowIdx < rows.length - 1) { rowIdx++; renderRows(); if (window.HomeSound) { window.HomeSound.play('move'); } } break;
            case KEY_LEFT:
                if (rows[rowIdx].type === 'option') { cycleOption(rows[rowIdx].opt, -1); } else { moveApp(-1); }
                break;
            case KEY_RIGHT:
                if (rows[rowIdx].type === 'option') { cycleOption(rows[rowIdx].opt, 1); } else { moveApp(1); }
                break;
            case KEY_ENTER:
                if (window.HomeSound) { window.HomeSound.play('select'); }
                if (rows[rowIdx].type === 'location') { startEdit(); }
                else if (rows[rowIdx].type === 'option') { cycleOption(rows[rowIdx].opt, 1); }
                else { toggleApp(); }
                break;
            case KEY_RETURN: hide(); break;
            default: handled = false;
        }
        if (handled) { event.preventDefault(); event.stopImmediatePropagation(); }
    }

    return {
        start: function (changeHandler) {
            onChange = changeHandler;
            root = document.getElementById('settings');
            rowsEl = document.getElementById('set-rows');
            locInput = document.getElementById('set-loc-input');
            document.addEventListener('keydown', onKey);
        },
        openSettings: show,
        isOpen: function () { return open; }
    };
}());
