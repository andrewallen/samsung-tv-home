// Original line glyphs, drawn as inline SVG. No brand logos.
// viewBox 0 0 48 48, white strokes, so they sit on any tile colour.
window.HOME_GLYPHS = {
    // App tiles
    clapper: '<path d="M7 20h34v18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M7 20l2-8 6 1-2 8M18 13l6 1-2 8M27 14l6 1-2 8M36 15l5 1-2 8"/>',
    play:    '<rect x="6" y="12" width="36" height="24" rx="6"/><path d="M20 18l11 6-11 6z" fill="currentColor" stroke="none"/>',
    circle:  '<circle cx="24" cy="24" r="17"/><path d="M20 16l12 8-12 8z" fill="currentColor" stroke="none"/>',
    film:    '<rect x="9" y="9" width="30" height="30" rx="3"/><path d="M16 9v30M32 9v30" /><path d="M12 16h4M12 24h4M12 32h4M36 16h-4M36 24h-4M36 32h-4" stroke-width="2.4"/>',
    screen:  '<rect x="6" y="11" width="36" height="24" rx="3"/><path d="M20 18l11 6-11 6z" fill="currentColor" stroke="none"/><path d="M17 41h14"/>',

    tv:      '<rect x="5" y="8" width="38" height="27" rx="4"/><path d="M17 41h14"/>',
    ytbadge: '<rect x="3" y="9" width="42" height="30" rx="9" fill="#e62117" stroke="none"/><path d="M20 17l12 7-12 7z" fill="#fff" stroke="none"/>',

    // Weather
    sun:    '<circle cx="24" cy="24" r="8"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3.5 3.5M33.5 33.5L37 37M37 11l-3.5 3.5M14.5 33.5L11 37"/>',
    partly: '<path d="M18 16a6 6 0 0 1 11 3" /><path d="M31 10v3M39 18h-3M37 12l-2 2" stroke-width="2.4"/><path d="M14 40h18a7 7 0 0 0 .5-14 9 9 0 0 0-17 1 6 6 0 0 0-1.5 13z"/>',
    moon:   '<path d="M31 8a17 17 0 1 0 10 29A14 14 0 0 1 31 8z"/>',
    cloud:  '<path d="M15 38h20a8 8 0 0 0 .5-16 10 10 0 0 0-19 1 7 7 0 0 0-1.5 15z"/>',
    rain:   '<path d="M15 30h20a8 8 0 0 0 .5-16 10 10 0 0 0-19 1 7 7 0 0 0-1.5 15z"/><path d="M18 36l-2 5M26 36l-2 5M34 36l-2 5" stroke-width="2.6"/>',
    snow:   '<path d="M15 30h20a8 8 0 0 0 .5-16 10 10 0 0 0-19 1 7 7 0 0 0-1.5 15z"/><path d="M18 38v.1M26 38v.1M34 38v.1M18 42v.1M26 42v.1M34 42v.1" stroke-width="4"/>',
    fog:    '<path d="M15 28h20a8 8 0 0 0 .5-16 10 10 0 0 0-19 1 7 7 0 0 0-1.5 15z"/><path d="M12 36h24M14 41h20" stroke-width="2.6"/>',
    storm:  '<path d="M15 28h20a8 8 0 0 0 .5-16 10 10 0 0 0-19 1 7 7 0 0 0-1.5 15z"/><path d="M26 33l-6 7h5l-2 6 7-8h-5z" fill="currentColor" stroke="none"/>'
};

window.homeGlyph = function (key, className) {
    var inner = window.HOME_GLYPHS[key] || '';
    return '<svg class="' + (className || '') + '" viewBox="0 0 48 48" fill="none" ' +
        'stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
        inner + '</svg>';
};
