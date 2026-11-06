// Time-of-day photo background. Eight graded versions of one scene are placed
// on the day, anchored to the real sunrise and sunset, and the two either side
// of "now" are blended continuously: the top layer's opacity is how far we are
// between them. Also switches the night stars, sun shimmer and overcast wash.
window.HomeScene = (function () {
    var IMAGES = ['01_pre_dawn', '02_sunrise', '03_morning', '04_midday',
        '05_golden_hour', '06_sunset', '07_dusk', '08_night'];
    var PRE_DAWN = 0, SUNRISE = 1, MORNING = 2, MIDDAY = 3, GOLDEN = 4, SUNSET = 5, DUSK = 6, NIGHT = 7;
    var TICK_MS = 30 * 1000;
    var LABELS = ['Pre-dawn', 'Sunrise', 'Morning', 'Midday', 'Golden hour', 'Sunset', 'Dusk', 'Night'];
    var EXPLORE_MS = 30 * 1000;

    var previewEls, previewFront = 0, previewIdx = -1, exploring = false, exploreTimer, liveShown = 0;

    var baseEl, topEl, keys, curA = -1, curB = -1;
    var sunrise = 7 * 60 + 10, sunset = 16 * 60 + 30, overcast = false;

    function url(i) { return 'url("img/bg/' + IMAGES[i] + '.jpg")'; }

    // Minutes after midnight for each image. Night holds until shortly before pre-dawn.
    function buildKeys() {
        var noon = (sunrise + sunset) / 2;
        keys = [
            { t: sunrise - 200, i: NIGHT },
            { t: sunrise - 80,  i: PRE_DAWN },
            { t: sunrise,       i: SUNRISE },
            { t: sunrise + 100, i: MORNING },
            { t: noon,          i: MIDDAY },
            { t: sunset - 90,   i: GOLDEN },
            { t: sunset,        i: SUNSET },
            { t: sunset + 45,   i: DUSK },
            { t: sunset + 120,  i: NIGHT }
        ];
    }

    function nowMinutes() {
        var d = new Date();
        return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    }

    // Which two images we're between, and how far (0 to 1).
    function segment(m) {
        var n = keys.length;
        for (var k = 0; k < n; k++) {
            var a = keys[k], b = keys[(k + 1) % n];
            var bt = b.t + (k === n - 1 ? 1440 : 0);
            var mm = (k === n - 1 && m < a.t) ? m + 1440 : m;
            if (mm >= a.t && mm < bt) {
                return { a: a.i, b: b.i, f: (mm - a.t) / (bt - a.t) };
            }
        }
        return { a: NIGHT, b: NIGHT, f: 0 };
    }

    function setTopOpacity(value, instant) {
        if (instant) {
            topEl.style.webkitTransition = 'none';
            topEl.style.transition = 'none';
            topEl.style.opacity = value;
            topEl.getBoundingClientRect();
            topEl.style.webkitTransition = '';
            topEl.style.transition = '';
        } else {
            topEl.style.opacity = value;
        }
    }

    function setMood(s) {
        var shown = s.f < 0.5 ? s.a : s.b;
        liveShown = shown;
        if (exploring) { return; }
        moodFor(shown);
    }

    // Movement for each time of day, matched to where the light is in that image.
    // sun: glow over the sun or moon (x, y, radius, rgb, strength); glint: lake light;
    // stars, mist and shadow (passing cloud shadow) are strengths from 0 to 1.
    // fog: strength over the valleys; motes: light specks (low sun only);
    // birds: chance of a flock crossing (daylight); shoot: shooting stars (dark sky).
    var SCENES = [
        { sun: [1728, 456, 520, '255,170,140', 0.35], glint: ['200,210,255', 0.3],  stars: 0.5,  fog: 1,    fogRgb: '175,190,230', motes: 0,   birds: 0,   shoot: 1,   shadow: 0 },
        { sun: [1560, 514, 620, '255,190,120', 0.6],  glint: ['255,200,140', 0.85], stars: 0,    fog: 0.7,  fogRgb: '255,228,205', motes: 0.5, birds: 0.7, shoot: 0,   shadow: 0 },
        { sun: null,                                 glint: ['255,255,255', 0.6],  stars: 0,    fog: 0.35, fogRgb: '255,255,255', motes: 0,   birds: 1,   shoot: 0,   shadow: 0.8 },
        { sun: [960, 77, 220, '255,252,240', 0.2],   glint: ['255,255,255', 0.85], stars: 0,    fog: 0.1,  fogRgb: '255,255,255', motes: 0,   birds: 1,   shoot: 0,   shadow: 1 },
        { sun: [24, 446, 720, '255,200,120', 0.6],    glint: ['255,210,150', 0.85], stars: 0,    fog: 0.35, fogRgb: '255,232,205', motes: 1,   birds: 0.8, shoot: 0,   shadow: 0.5 },
        { sun: [86, 518, 720, '255,120,80', 0.55],    glint: ['255,150,110', 0.85], stars: 0,    fog: 0.5,  fogRgb: '255,195,175', motes: 0.8, birds: 0.5, shoot: 0,   shadow: 0 },
        { sun: [240, 330, 620, '230,150,200', 0.25],  glint: ['210,190,255', 0.4],  stars: 0.4,  fog: 0.8,  fogRgb: '205,195,238', motes: 0,   birds: 0,   shoot: 0.5, shadow: 0 },
        { sun: [1536, 158, 420, '210,225,255', 0.45], glint: ['200,220,255', 0.7],  stars: 1,    fog: 0.9,  fogRgb: '165,185,232', motes: 0,   birds: 0,   shoot: 1,   shadow: 0 }
    ];
    // Light rays fanning out from a low sun: angles point away from it.
    var RAYS = {};
    RAYS[1] = { at: [1560, 514], rgb: '255,205,150', angles: [148, 160, 171, 182, 194, 206], strength: 0.75 };
    RAYS[4] = { at: [24, 446],   rgb: '255,215,160', angles: [-28, -16, -5, 6, 16, 27],      strength: 0.85 };
    RAYS[5] = { at: [86, 518],   rgb: '255,160,120', angles: [-24, -13, -3, 7, 17, 28],      strength: 0.7 };
    var MOTE_RGB = ['255,215,160', '255,215,160', '255,255,255', '255,255,255', '255,210,140', '255,170,120', '235,225,170', '220,235,190'];
    var effectsShown = -1, overcastShown = null;

    var skyShown = -1, skyTimer;
    function setSkyDrift(i) {
        if (i === skyShown) { return; }
        var el = document.getElementById('skydrift');
        var first = skyShown < 0;
        skyShown = i;
        if (first) { el.style.backgroundImage = url(i); return; }
        el.style.opacity = 0;
        clearTimeout(skyTimer);
        skyTimer = setTimeout(function () {
            el.style.backgroundImage = url(skyShown);
            el.style.opacity = 1;
        }, 650);
    }

    function moodFor(shown) {
        var cls = document.body.className.replace(/\s*is-overcast/g, '');
        if (overcast) { cls += ' is-overcast'; }
        document.body.className = cls;
        if (shown === effectsShown && overcast === overcastShown) { return; }
        effectsShown = shown;
        overcastShown = overcast;
        scheduleLife();

        setSkyDrift(shown);
        var sc = SCENES[shown];
        var dull = overcast ? 0.85 : 1;
        var sun = document.getElementById('fx-sun');
        if (sc.sun) {
            var r = sc.sun[2];
            sun.style.left = (sc.sun[0] - r) + 'px';
            sun.style.top = (sc.sun[1] - r) + 'px';
            sun.style.width = (2 * r) + 'px';
            sun.style.height = (2 * r) + 'px';
            sun.style.background = 'radial-gradient(circle, rgba(' + sc.sun[3] + ', 0.7) 0%, rgba(' +
                sc.sun[3] + ', 0.2) 26%, rgba(' + sc.sun[3] + ', 0) 62%)';
            sun.style.opacity = sc.sun[4] * dull;
        } else {
            sun.style.opacity = 0;
        }

        var glint = document.getElementById('fx-glint');
        var gs = glint.children;
        for (var i = 0; i < gs.length; i++) {
            gs[i].style.background = 'radial-gradient(ellipse at center, rgba(' + sc.glint[0] +
                ', 0.95) 0%, rgba(' + sc.glint[0] + ', 0) 70%)';
        }
        glint.style.opacity = sc.glint[1] * dull;

        var rays = document.getElementById('fx-rays'), rc = RAYS[shown];
        if (rc && !calm()) {
            rays.style.left = rc.at[0] + 'px';
            rays.style.top = rc.at[1] + 'px';
            var beams = rays.children;
            for (var bi = 0; bi < beams.length; bi++) {
                var ang = rc.angles[bi % rc.angles.length];
                beams[bi].style.webkitTransform = beams[bi].style.transform = 'rotate(' + ang + 'deg)';
                beams[bi].style.background = 'linear-gradient(90deg, rgba(' + rc.rgb + ', 0.32) 0%, rgba(' + rc.rgb + ', 0.12) 45%, rgba(' + rc.rgb + ', 0) 100%)';
            }
            rays.style.opacity = rc.strength * (overcast ? 0.5 : 1);
        } else {
            rays.style.opacity = 0;
        }

        document.getElementById('stars').style.opacity = sc.stars;
        document.getElementById('fx-shadow').style.opacity = sc.shadow * dull;

        var motes = document.getElementById('motes');
        var mc = MOTE_RGB[shown];
        var ms = motes.children;
        for (var j = 0; j < ms.length; j++) {
            ms[j].style.background = 'radial-gradient(circle, rgba(' + mc + ', 1) 0%, rgba(' + mc + ', 0.35) 40%, rgba(' + mc + ', 0) 70%)';
        }
        motes.style.opacity = calm() ? 0 : sc.motes * dull;

        var fog = document.getElementById('fog');
        var ws = fog.children;
        for (var w = 0; w < ws.length; w++) {
            ws[w].style.background = 'radial-gradient(ellipse at center, rgba(' + sc.fogRgb + ', 0.36) 0%, rgba(' +
                sc.fogRgb + ', 0.2) 35%, rgba(' + sc.fogRgb + ', 0.07) 58%, rgba(' + sc.fogRgb + ', 0) 72%)';
        }
        fog.style.opacity = Math.min(1, sc.fog + (overcast ? 0.25 : 0));
    }

    function fixedScene() {
        var v = window.HomeConfig ? window.HomeConfig.getOpt('scene', 'live') : 'live';
        return v === 'live' ? -1 : parseInt(v, 10);
    }
    function calm() {
        return window.HomeConfig && window.HomeConfig.getOpt('motion', 'full') === 'calm';
    }

    function apply(instant) {
        var fixed = fixedScene();
        var s = fixed >= 0 ? { a: fixed, b: fixed, f: 0 } : segment(nowMinutes());
        if (s.a !== curA) {
            // The base takes the image the top layer was fading in, then the top resets.
            baseEl.style.backgroundImage = url(s.a);
            curA = s.a;
            setTopOpacity(0, true);
        }
        if (s.b !== curB) {
            topEl.style.backgroundImage = url(s.b);
            curB = s.b;
        }
        setTopOpacity(s.a === s.b ? 0 : s.f.toFixed(3), instant);
        setMood(s);
    }

    // ---- Life: birds, a hawk and contrails by day; meteors, aircraft,
    // satellites and the odd aurora by night ----

    // A bird whose wings beat a few times and then glide (SVG path morph).
    function birdSvg(w, beat, delay) {
        var up = 'M1 7 Q6 1 12 7 Q18 1 23 7', down = 'M1 4 Q6 10 12 7 Q18 10 23 4', glide = 'M1 7 Q6 4 12 7 Q18 4 23 7';
        return '<svg width="' + w + '" height="' + Math.round(w / 2) + '" viewBox="0 0 24 12">' +
            '<path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="' + up + '">' +
            '<animate attributeName="d" dur="' + beat + 's" begin="-' + delay + 's" repeatCount="indefinite" ' +
            'keyTimes="0;0.12;0.24;0.36;0.48;0.6;1" values="' + [up, down, up, down, up, glide, glide].join(';') + '"/>' +
            '</path></svg>';
    }

    function currentScene() { return exploring ? previewIdx : liveShown; }

    function travel(el, x1, y1, x2, y2, dur, flip) {
        var f = flip ? ' scaleX(-1)' : '';
        el.style.webkitTransform = el.style.transform = 'translate3d(' + x1 + 'px,' + y1 + 'px,0)' + f;
        el.style.webkitTransitionDuration = el.style.transitionDuration = dur + 's';
        document.getElementById('life').appendChild(el);
        el.getBoundingClientRect();
        el.style.webkitTransform = el.style.transform = 'translate3d(' + x2 + 'px,' + y2 + 'px,0)' + f;
        setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, dur * 1000 + 600);
    }

    // A flock: a loose scatter of small birds, or a V of geese when the sun is low.
    function launchFlock() {
        if (calm()) { return; }
        var scene = currentScene(), sc = SCENES[scene];
        if (!sc.birds) { return; }
        var lowSun = scene === SUNRISE || scene === SUNSET || scene === GOLDEN;
        var geese = lowSun && Math.random() < 0.6;
        var flock = document.createElement('div');
        flock.className = 'flock';
        var n = geese ? 5 + Math.floor(Math.random() * 5) : 3 + Math.floor(Math.random() * 6);
        var size = 0.75 + Math.random() * 0.55;              // distance: smaller is further away
        var colour = lowSun ? 'rgba(24, 12, 16, 0.88)' : 'rgba(20, 28, 38, 0.72)';
        var html = '';
        for (var i = 0; i < n; i++) {
            var bx, by;
            if (geese) {
                var rank = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
                bx = 120 - rank * 22 * size + Math.random() * 4;
                by = 40 + side * rank * 12 * size + Math.random() * 4;
            } else {
                bx = Math.random() * 140 * size;
                by = Math.random() * 50 * size;
            }
            var w = Math.round((geese ? 26 : 20) * size * (0.85 + Math.random() * 0.3));
            html += '<div class="bird" style="left:' + Math.round(bx) + 'px;top:' + Math.round(by) + 'px;color:' + colour +
                ';-webkit-animation-duration:' + (2 + Math.random() * 2).toFixed(1) + 's;animation-duration:' + (2 + Math.random() * 2).toFixed(1) +
                's;-webkit-animation-delay:-' + (Math.random() * 3).toFixed(1) + 's;animation-delay:-' + (Math.random() * 3).toFixed(1) + 's">' +
                birdSvg(w, (geese ? 1.6 : 1.1) + Math.random() * 0.5, (Math.random() * 1.5).toFixed(2)) + '</div>';
        }
        flock.innerHTML = html;
        var ltr = Math.random() < 0.5;
        var y = 70 + Math.random() * 140;
        var dur = (geese ? 38 : 28) + Math.random() * 14;
        travel(flock, ltr ? -280 : 2200, y, ltr ? 2200 : -280, y + (Math.random() * 120 - 60), dur, !ltr);
    }

    // A lone hawk, larger and nearer, gliding low over the hills.
    function launchHawk() {
        if (calm()) { return; }
        var scene = currentScene();
        var dark = scene === SUNSET || scene === SUNRISE || scene === GOLDEN;
        var el = document.createElement('div');
        el.className = 'flock';
        el.innerHTML = '<div class="bird hawk" style="color:' + (dark ? 'rgba(25,14,18,0.9)' : 'rgba(20,26,34,0.85)') + '">' +
            birdSvg(46, 3.2, 0) + '</div>';
        var ltr = Math.random() < 0.5;
        var y = 300 + Math.random() * 110;
        travel(el, ltr ? -90 : 2010, y, ltr ? 2010 : -90, y - 70 + Math.random() * 90, 36 + Math.random() * 10, !ltr);
    }

    // A high jet by day, its contrail growing behind it and fading at the far end.
    function launchJet() {
        if (calm()) { return; }
        var el = document.createElement('div');
        el.className = 'jet';
        el.innerHTML = '<span class="jet-trail"></span><span class="jet-body"></span>';
        var ltr = Math.random() < 0.5;
        var y1 = 40 + Math.random() * 120, y2 = y1 + (Math.random() * 80 - 30);
        if (!ltr) { el.className += ' is-rtl'; }
        travel(el, ltr ? -40 : 1960, y1, ltr ? 1960 : -40, y2, 80 + Math.random() * 30, false);
    }

    // Meteors: a bright head with a tapering tail, at varied angles, lengths and speeds.
    function launchShootingStar() {
        if (calm()) { return; }
        var sc = SCENES[currentScene()];
        if (!sc.shoot) { return; }
        var burst = Math.random() < 0.1 ? 3 + Math.floor(Math.random() * 3) : 1;
        var angle = 12 + Math.random() * 30;
        for (var k = 0; k < burst; k++) {
            setTimeout(function () { oneMeteor(burst > 1 ? angle + Math.random() * 6 - 3 : 12 + Math.random() * 30); }, k * (250 + Math.random() * 500));
        }
    }

    function oneMeteor(angle) {
        var wrap = document.createElement('div');
        wrap.className = 'meteor';
        var len = 110 + Math.random() * 230;
        var dur = 0.55 + Math.random() * 0.9;
        var bright = 0.55 + Math.random() * 0.45;
        var ltr = Math.random() < 0.7;
        wrap.style.left = Math.round(150 + Math.random() * 1450) + 'px';
        wrap.style.top = Math.round(30 + Math.random() * 300) + 'px';
        wrap.style.webkitTransform = wrap.style.transform = 'rotate(' + (ltr ? angle : 180 - angle).toFixed(1) + 'deg)';
        wrap.innerHTML = '<span class="meteor-streak" style="width:' + Math.round(len) + 'px;opacity:0;' +
            '-webkit-animation-duration:' + dur.toFixed(2) + 's;animation-duration:' + dur.toFixed(2) + 's"><i style="opacity:' + bright.toFixed(2) + '"></i></span>';
        document.getElementById('life').appendChild(wrap);
        setTimeout(function () { if (wrap.parentNode) { wrap.parentNode.removeChild(wrap); } }, dur * 1000 + 400);
    }

    // Night aircraft (double white strobe, red beacon) and satellites (steady, slow).
    function launchSkyLight(isSatellite) {
        if (calm()) { return; }
        var el = document.createElement('div');
        el.className = isSatellite ? 'skylight satellite' : 'skylight aircraft';
        if (!isSatellite) { el.innerHTML = '<span class="strobe"></span><span class="beacon"></span>'; }
        var ltr = Math.random() < 0.5;
        var y1 = 50 + Math.random() * 220, y2 = y1 + (Math.random() * 140 - 50);
        travel(el, ltr ? -20 : 1940, y1, ltr ? 1940 : -20, y2, isSatellite ? 36 + Math.random() * 14 : 70 + Math.random() * 30, false);
    }

    // A rare, faint aurora low in the northern sky: fades in, ripples, fades out.
    function launchAurora() {
        if (calm() || Math.random() > 0.3) { return; }
        var el = document.createElement('div');
        el.className = 'aurora-glow';
        el.innerHTML = '<span class="band b1"></span><span class="band b2"></span><span class="band b3"></span>';
        document.getElementById('life').appendChild(el);
        setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, 92000);
    }

    // Events restart whenever the scene changes, so something happens within
    // seconds of any time of day appearing, live or while exploring.
    var lifeToken = 0, lifeScene = -1;
    function lifeLoop(token, fn, first, min, max) {
        setTimeout(function tick() {
            if (token !== lifeToken) { return; }
            fn();
            setTimeout(tick, (min + Math.random() * (max - min)) * 1000);
        }, first * 1000);
    }
    function scheduleLife() {
        var scene = currentScene();
        if (scene === lifeScene) { return; }
        lifeScene = scene;
        var token = ++lifeToken;
        // Clear anything from the previous scene, such as birds flying into a night sky.
        var life = document.getElementById('life');
        while (life.firstChild) { life.removeChild(life.firstChild); }
        var sc = SCENES[scene];
        if (sc.birds) {
            lifeLoop(token, launchFlock, 1.5, 16, 32);
            if (scene === MORNING || scene === MIDDAY || scene === GOLDEN) {
                lifeLoop(token, launchJet, 12, 120, 240);
            }
        }
        if (sc.shoot) {
            lifeLoop(token, launchShootingStar, 1.5, 9, 22);
            lifeLoop(token, function () { launchSkyLight(false); }, 10, 60, 120);
            lifeLoop(token, function () { launchSkyLight(true); }, 40, 120, 240);
            if (scene === NIGHT) { lifeLoop(token, launchAurora, 60, 180, 360); }
        }
    }

    function renderExplore() {
        document.getElementById('explore-label').textContent = LABELS[previewIdx];
        var html = '';
        for (var i = 0; i < IMAGES.length; i++) {
            var cls = 'dot';
            if (i === previewIdx) { cls += ' is-current'; }
            if (i === liveShown) { cls += ' is-live'; }
            html += '<span class="' + cls + '"></span>';
        }
        document.getElementById('explore-dots').innerHTML = html;
    }

    function endExplore() {
        exploring = false;
        previewIdx = -1;
        effectsShown = -1;
        document.body.className = document.body.className.replace(/\s*is-exploring/g, '');
        previewEls[0].className = 'photo preview';
        previewEls[1].className = 'photo preview';
        document.getElementById('explore').className = 'explore';
        apply();
    }

    // Step through the day's images; the live scene returns after a quiet spell.
    function explore(step) {
        if (window.HomeSound) { window.HomeSound.play('swipe'); }
        if (!exploring) {
            exploring = true;
            document.body.className += ' is-exploring';
            previewIdx = liveShown;
        }
        previewIdx = (previewIdx + step + IMAGES.length) % IMAGES.length;
        // Fade the new image in on the back preview layer, over the front one.
        var back = previewEls[1 - previewFront];
        var front = previewEls[previewFront];
        // Reset the back layer to invisible, on top, with no transition...
        back.style.webkitTransition = 'none';
        back.style.transition = 'none';
        back.className = 'photo preview is-front';
        back.style.backgroundImage = url(previewIdx);
        back.getBoundingClientRect();
        back.style.webkitTransition = '';
        back.style.transition = '';
        // ...then fade it in over the image that's already showing.
        back.className = 'photo preview is-shown is-front';
        front.className = front.style.backgroundImage ? 'photo preview is-shown' : 'photo preview';
        previewFront = 1 - previewFront;
        moodFor(previewIdx);
        renderExplore();
        document.getElementById('explore').className = 'explore is-showing';
        clearTimeout(exploreTimer);
        exploreTimer = setTimeout(endExplore, EXPLORE_MS);
    }

    return {
        explore: explore,
        refresh: function () { effectsShown = -1; apply(true); },
        start: function () {
            baseEl = document.getElementById('photo-base');
            topEl = document.getElementById('photo-top');
            previewEls = [document.getElementById('preview-a'), document.getElementById('preview-b')];
            // Preload every image so a change never shows a blank frame.
            IMAGES.forEach(function (name) { var img = new Image(); img.src = 'img/bg/' + name + '.jpg'; });
            buildKeys();
            apply(true);
            setInterval(apply, TICK_MS);
        },
        setSun: function (riseMs, setMs) {
            var r = new Date(riseMs), s = new Date(setMs);
            sunrise = r.getHours() * 60 + r.getMinutes();
            sunset = s.getHours() * 60 + s.getMinutes();
            buildKeys();
            apply();
        },
        setOvercast: function (value) {
            overcast = value;
            apply();
        }
    };
}());
