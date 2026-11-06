// Time and date from the TV's own clock, in British format.
window.HomeClock = (function () {
    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];

    var timeEl, dateEl, greetEl, shown = '';

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function greeting(hour) {
        if (hour < 5) { return 'Good night'; }
        if (hour < 12) { return 'Good morning'; }
        if (hour < 18) { return 'Good afternoon'; }
        return 'Good evening';
    }

    function opt(key, fallback) {
        return window.HomeConfig ? window.HomeConfig.getOpt(key, fallback) : fallback;
    }

    function update(force) {
        var now = new Date();
        var h = now.getHours(), m = pad(now.getMinutes());
        var twelve = opt('clock', '24') === '12';
        var dateStyle = opt('date', 'full');
        var key = h + ':' + m + twelve + dateStyle;
        if (key === shown && !force) { return; }
        shown = key;
        if (twelve) {
            var h12 = h % 12 === 0 ? 12 : h % 12;
            timeEl.innerHTML = h12 + ':' + m + '<span class="ampm">' + (h < 12 ? 'am' : 'pm') + '</span>';
        } else {
            timeEl.textContent = pad(h) + ':' + m;
        }
        if (dateStyle === 'short') {
            dateEl.textContent = DAYS[now.getDay()].slice(0, 3) + ' ' + now.getDate() + ' ' + MONTHS[now.getMonth()].slice(0, 3);
        } else {
            dateEl.textContent = DAYS[now.getDay()] + ' ' + now.getDate() + ' ' + MONTHS[now.getMonth()];
        }
        if (greetEl) { greetEl.textContent = greeting(h); }
    }

    return {
        start: function () {
            timeEl = document.getElementById('time');
            dateEl = document.getElementById('date');
            greetEl = document.getElementById('greeting');
            update();
            setInterval(update, 1000);
        },
        update: function () { update(true); }
    };
}());
