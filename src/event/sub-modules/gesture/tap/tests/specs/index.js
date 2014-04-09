KISSY.add(function (S, require) {
    if (!S.UA.phantomjs && S.Feature.isTouchEventSupported()) {
        require('./double-tap');
        require('./tap');
        require('./tap-hold');
    }
});