// Soft interface tones, made with Web Audio so no sound files are needed.
//  move:   a short, quiet tick when the selection moves
//  select: a slightly fuller, lower tone when something is chosen
//  swipe:  a soft breath when exploring the times of day
// Turned off with the Sounds option in settings.
window.HomeSound = (function () {
    var ctx = null;

    function enabled() {
        return !window.HomeConfig || window.HomeConfig.getOpt('sound', 'on') !== 'off';
    }

    function context() {
        if (ctx) { return ctx; }
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { return null; }
        try { ctx = new AC(); } catch (e) { ctx = null; }
        return ctx;
    }

    function tone(freqStart, freqEnd, duration, volume, type) {
        var c = context();
        if (!c) { return; }
        var t = c.currentTime;
        var osc = c.createOscillator();
        var gain = c.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freqStart, t);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(volume, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
    }

    return {
        play: function (kind) {
            if (!enabled()) { return; }
            try {
                if (kind === 'select') {
                    tone(660, 440, 0.16, 0.09, 'sine');
                    tone(990, 660, 0.12, 0.03, 'sine');
                } else if (kind === 'swipe') {
                    tone(520, 380, 0.14, 0.035, 'triangle');
                } else {
                    tone(1250, 950, 0.05, 0.05, 'sine');
                }
            } catch (e) { /* sound is optional */ }
        }
    };
}());
