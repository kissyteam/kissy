KISSY.add(function (S) {
    var mods = S.makeArray(arguments).slice(1);
    if (!S.UA.phantomjs && S.Feature.isTouchEventSupported()) {
        S.each(mods, function (mod) {
            mod.init();
        });
    }
}, {
    requires: [
        './double-tap',
        './pinch',
        './rotate',
        './swipe',
        './tap',
        './tap-hold'
    ]
});