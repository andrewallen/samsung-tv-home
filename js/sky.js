// A continuous solar gradient: the background colour is interpolated from the
// time of day, anchored to the real sunrise and sunset, and crossfaded.
// Built for the M47 engine: linear-gradient and opacity transitions only.
window.HomeSky = (function () {
    var TICK_MS = 30 * 1000;

    // Three stops (top, middle, bottom) for each moment of the day.
    var NIGHT = ['#060b1c', '#101a3a', '#1c2b52'];
    var PRE   = ['#101640', '#3a3566', '#7a5570'];
    var DAWN  = ['#1b2550', '#5b5088', '#e7a279'];
    var MORN  = ['#1f5f9e', '#5fa0cf', '#cfe7ee'];
    var DAY   = ['#1f74b6', '#4f9bcf', '#bfe2ee'];
    var GOLD  = ['#274a94', '#9a5f9a', '#f2b073'];
    var DUSK  = ['#201d4e', '#6b3a79', '#db6f63'];
    var EVE   = ['#0b1230', '#20305a', '#3a3f74'];
    var OVERCAST = ['#2b333f', '#3b4552', '#59636f'];

    var layers, current = 0, lastGrad = '';
    var overcast = false;
    var keys = buildKeys(7 * 60, 17 * 60);

    function hexToRgb(h) {
        h = h.replace('#', '');
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
    function toHex(v) {
        v = Math.max(0, Math.min(255, Math.round(v)));
        var s = v.toString(16);
        return s.length < 2 ? '0' + s : s;
    }
    function mix(h1, h2, t) {
        var a = hexToRgb(h1), b = hexToRgb(h2);
        return '#' + toHex(a[0] + (b[0] - a[0]) * t) + toHex(a[1] + (b[1] - a[1]) * t) + toHex(a[2] + (b[2] - a[2]) * t);
    }
    function mixStops(c1, c2, t) {
        return [mix(c1[0], c2[0], t), mix(c1[1], c2[1], t), mix(c1[2], c2[2], t)];
    }

    function buildKeys(sr, ss) {
        var midday = (sr + ss) / 2;
        return [
            { t: 0,         c: NIGHT },
            { t: sr - 90,   c: PRE },
            { t: sr,        c: DAWN },
            { t: sr + 75,   c: MORN },
            { t: midday,    c: DAY },
            { t: ss - 75,   c: GOLD },
            { t: ss,        c: DUSK },
            { t: ss + 90,   c: EVE },
            { t: 1440,      c: NIGHT }
        ].sort(function (a, b) { return a.t - b.t; });
    }

    function nowMinutes() {
        var d = new Date();
        return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    }

    function stopsAt(min) {
        var i, a = keys[0], b = keys[keys.length - 1];
        for (i = 0; i < keys.length - 1; i++) {
            if (min >= keys[i].t && min <= keys[i + 1].t) {
                a = keys[i];
                b = keys[i + 1];
                break;
            }
        }
        var span = b.t - a.t;
        var frac = span > 0 ? (min - a.t) / span : 0;
        var stops = mixStops(a.c, b.c, frac);
        if (overcast) {
            stops = [mix(stops[0], OVERCAST[0], 0.5), mix(stops[1], OVERCAST[1], 0.5), mix(stops[2], OVERCAST[2], 0.5)];
        }
        return stops;
    }

    function toGradient(stops) {
        return 'linear-gradient(180deg, ' + stops[0] + ' 0%, ' + stops[1] + ' 55%, ' + stops[2] + ' 100%)';
    }

    function rgba(hex, alpha) {
        var c = hexToRgb(hex);
        return 'rgba(' + c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + alpha + ')';
    }

    // Tint the landscape from the sky: ridges darken from the sky colours,
    // the horizon glow and the mist lighten from them.
    function tintScene(stops) {
        var far = document.getElementById('ridge-far');
        var mid = document.getElementById('ridge-mid');
        var near = document.getElementById('ridge-near');
        if (far) { far.setAttribute('fill', mix(stops[1], '#05070f', 0.42)); }
        if (mid) { mid.setAttribute('fill', mix(stops[1], '#04060c', 0.64)); }
        if (near) { near.setAttribute('fill', mix(stops[0], '#020309', 0.58)); }

        var sun = document.getElementById('sunglow');
        if (sun) {
            var g = mix(stops[2], '#ffffff', 0.2);
            sun.style.background = 'radial-gradient(ellipse at 72% 84%, ' + rgba(g, 0.85) + ' 0%, ' +
                rgba(g, 0.32) + ' 22%, ' + rgba(g, 0) + ' 52%)';
        }
    }

    function crossfade(grad, instant) {
        var next = instant ? current : 1 - current;
        layers[next].style.background = grad;
        layers[next].className = 'sky is-showing';
        if (next !== current) {
            layers[current].className = 'sky';
            current = next;
        }
        lastGrad = grad;
    }

    function tick(instant) {
        var stops = stopsAt(nowMinutes());
        var grad = toGradient(stops);
        if (grad !== lastGrad) {
            crossfade(grad, instant);
            tintScene(stops);
        }
    }

    return {
        start: function (elA, elB) {
            layers = [elA, elB];
            tick(true);
            setInterval(tick, TICK_MS);
        },
        setSun: function (riseMs, setMs) {
            var r = new Date(riseMs), s = new Date(setMs);
            keys = buildKeys(r.getHours() * 60 + r.getMinutes(), s.getHours() * 60 + s.getMinutes());
            tick();
        },
        setOvercast: function (value) {
            if (value !== overcast) {
                overcast = value;
                tick();
            }
        }
    };
}());
