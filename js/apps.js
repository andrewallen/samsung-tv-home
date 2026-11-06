// Apps shown on the home screen, in order. The settings screen can reorder,
// show or hide them, and saves that per TV.
//
// This public list is an example. Your real list goes in tvs.json under
// "local" -> "apps"; tools/deploy.py writes it to js/local.js (not tracked by
// git), which replaces this list on the TV.
//
// IDs are Tizen app IDs (python3 tools/deploy.py apps <tv ip>).
// 'launchId' overrides the id used to launch (for native TV apps).
// 'hint' is shown if a launch can't be completed.
// 'icon' picks a glyph from js/glyphs.js: tv, film, ytbadge, play, clapper, circle, screen.
window.HOME_APPS = (window.HOME_LOCAL && window.HOME_LOCAL.apps) || [
    {
        id: 'live-tv',
        launchId: 'org.tizen.tv-viewer',
        name: 'Live TV',
        icon: 'tv',
        colour: '#1a3b8f',
        hint: 'Live channels open from the TV itself. Press Source or the Home button on your remote.'
    },
    { id: '111299001912', name: 'YouTube', icon: 'ytbadge', colour: '#c4302b' }
];
