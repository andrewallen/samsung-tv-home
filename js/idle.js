// Panel care for an old plasma-era-sensitive LCD showing a mostly static screen:
//  - a slow, constant drift of the whole screen so no pixel stays fixed;
//  - a gentle dim after a few idle minutes, cleared by any key.
window.HomeIdle = (function () {
    var DRIFT_MS = 40000;
    var IDLE_MS = 5 * 60 * 1000;
    // Eight points around a small circle; the screen creeps between them.
    var OFFSETS = [[0, -12], [9, -9], [12, 0], [9, 9], [0, 12], [-9, 9], [-12, 0], [-9, -9]];

    var home, dim, driftIndex = 0, idleTimer;

    function drift() {
        driftIndex = (driftIndex + 1) % OFFSETS.length;
        var o = OFFSETS[driftIndex];
        var move = 'translate3d(' + o[0] + 'px, ' + o[1] + 'px, 0)';
        home.style.webkitTransform = move;
        home.style.transform = move;
    }

    function wake() {
        dim.classList.remove('is-dim');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () {
            dim.classList.add('is-dim');
        }, IDLE_MS);
    }

    return {
        start: function () {
            home = document.getElementById('home');
            dim = document.getElementById('dim');
            setInterval(drift, DRIFT_MS);
            document.addEventListener('keydown', wake);
            wake();
        }
    };
}());
