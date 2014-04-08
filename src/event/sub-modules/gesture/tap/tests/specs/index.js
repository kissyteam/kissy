KISSY.add(function (S) {
    if (!S.UA.phantomjs && S.Feature.isTouchEventSupported()) {
        require('./double-tap');
        require('./tap');
        require('./tap-hold');
    }
});