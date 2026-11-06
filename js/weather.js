// Current weather and a three-day forecast from Open-Meteo (no key needed).
// The location comes from HomeConfig. The sky (js/sky.js) is fed sunrise,
// sunset and cloud. Postcodes are resolved with postcodes.io.
window.HomeWeather = (function () {
    var REFRESH_MS = 30 * 60 * 1000;
    var SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function place() { return window.HomeConfig.getPlace(); }

    function glyphFor(code, isDay) {
        if (code === 0 || code === 1) { return isDay ? 'sun' : 'moon'; }
        if (code === 2) { return isDay ? 'partly' : 'cloud'; }
        if (code === 3) { return 'cloud'; }
        if (code <= 48) { return 'fog'; }
        if (code <= 67) { return 'rain'; }
        if (code <= 77) { return 'snow'; }
        if (code <= 82) { return 'rain'; }
        if (code <= 86) { return 'snow'; }
        return 'storm';
    }

    function describe(code) {
        if (code === 0) { return 'Clear'; }
        if (code === 1) { return 'Mostly clear'; }
        if (code === 2) { return 'Partly cloudy'; }
        if (code === 3) { return 'Cloudy'; }
        if (code <= 48) { return 'Fog'; }
        if (code <= 57) { return 'Drizzle'; }
        if (code <= 67) { return 'Rain'; }
        if (code <= 77) { return 'Snow'; }
        if (code <= 82) { return 'Showers'; }
        if (code <= 86) { return 'Snow showers'; }
        return 'Thunderstorms';
    }

    // Open-Meteo gives local times without an offset, such as 2026-11-05T07:08.
    function parseLocal(text) {
        var p = text.split(/[-T:]/);
        return new Date(+p[0], +p[1] - 1, +p[2], +p[3], +p[4]).getTime();
    }

    function degrees(value) { return Math.round(value) + '°'; }

    function render(data) {
        document.getElementById('temperature').textContent = degrees(data.current.temperature_2m);
        document.getElementById('condition').textContent = describe(data.current.weather_code);
        document.getElementById('wx-glyph').innerHTML = window.homeGlyph(glyphFor(data.current.weather_code, data.current.is_day !== 0));

        var html = '';
        // Index 0 is today, so the forecast starts from tomorrow.
        for (var i = 1; i < data.daily.time.length; i++) {
            var day = SHORT_DAYS[new Date(parseLocal(data.daily.time[i] + 'T12:00')).getDay()];
            html += '<span class="day"><span class="day-name">' + day + '</span>' +
                degrees(data.daily.temperature_2m_max[i]) + '</span>';
        }
        document.getElementById('forecast').innerHTML = html;

        if (window.HomeSky) {
            window.HomeSky.setSun(parseLocal(data.daily.sunrise[0]), parseLocal(data.daily.sunset[0]));
            window.HomeSky.setOvercast(data.current.weather_code >= 3);
        }
        if (window.HomeScene) {
            window.HomeScene.setSun(parseLocal(data.daily.sunrise[0]), parseLocal(data.daily.sunset[0]));
            window.HomeScene.setOvercast(data.current.weather_code >= 3);
        }
    }

    function fail() {
        document.getElementById('condition').textContent = 'Forecast unavailable';
    }

    function refresh() {
        var p = place();
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + p.latitude +
            '&longitude=' + p.longitude +
            '&current=temperature_2m,weather_code,is_day' +
            '&daily=weather_code,temperature_2m_max,sunrise,sunset' +
            '&timezone=auto&forecast_days=4';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.timeout = 15000;
        xhr.onload = function () {
            if (xhr.status !== 200) { fail(); return; }
            try { render(JSON.parse(xhr.responseText)); } catch (e) { fail(); }
        };
        xhr.onerror = fail;
        xhr.ontimeout = fail;
        xhr.send();
    }

    // Resolve a UK postcode to a place via postcodes.io. cb(place) or cb(null).
    function geocode(postcode, cb) {
        var clean = postcode.replace(/\s+/g, '');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.postcodes.io/postcodes/' + encodeURIComponent(clean));
        xhr.timeout = 15000;
        xhr.onload = function () {
            if (xhr.status !== 200) { cb(null); return; }
            try {
                var r = JSON.parse(xhr.responseText).result;
                // postcodes.io has no town field, so show the postcode as entered.
                cb({ name: r.postcode || clean, latitude: r.latitude, longitude: r.longitude });
            } catch (e) { cb(null); }
        };
        xhr.onerror = function () { cb(null); };
        xhr.ontimeout = function () { cb(null); };
        xhr.send();
    }

    function showPlace() {
        document.getElementById('place').textContent = place().name;
    }

    return {
        start: function () {
            showPlace();
            refresh();
            setInterval(refresh, REFRESH_MS);
        },
        reload: function () { showPlace(); refresh(); },
        refresh: refresh,
        geocode: geocode
    };
}());
