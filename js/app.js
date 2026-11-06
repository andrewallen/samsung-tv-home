(function () {
    HomeSky.start(document.getElementById('sky-a'), document.getElementById('sky-b'));
    HomeScene.start();
    HomeClock.start();
    HomeWeather.start();

    // Display options from settings: show or hide parts, and refresh what depends on them.
    function applyOptions() {
        var cls = document.body.className.replace(/\s*(no-weather|no-forecast|no-date)/g, '');
        if (HomeConfig.getOpt('weather', 'on') === 'off') { cls += ' no-weather'; }
        if (HomeConfig.getOpt('forecast', 'on') === 'off') { cls += ' no-forecast'; }
        if (HomeConfig.getOpt('date', 'full') === 'off') { cls += ' no-date'; }
        document.body.className = cls;
        HomeClock.update();
        HomeScene.refresh();
    }

    HomeSettings.start(function () {
        HomeList.rebuild();
        applyOptions();
    });

    HomeList.build(
        document.getElementById('applist'),
        function (app) { HomeLauncher.open(app); },
        function () { HomeSettings.openSettings(); }
    );

    HomeInputs.start(function () { HomeList.comeBack(); });
    // Private mode (code on the number keys): refresh the list and the hint.
    function applyPrivate(priv) {
        HomeList.rebuild();
        var hint = document.querySelector('.hint');
        if (hint) { hint.textContent = priv ? 'Left and Right to explore the day' : 'Left and Right to explore the day, Return for settings'; }
    }
    HomeLock.start(applyPrivate);
    applyPrivate(HomeLock.isPrivate());

    HomeIdle.start();
    applyOptions();

    // JavaScript pauses while another app is open, so catch up on return.
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            HomeClock.update();
            HomeWeather.refresh();
        }
    });

    document.getElementById('home').classList.add('is-ready');
}());
