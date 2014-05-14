KISSY.add(function (S, require) {
    var Feature = require('feature');
    if (!S.UA.phantomjs && Feature.isTouchEventSupported()) {
        require('./double-tap');
        require('./tap');
        require('./tap-hold');
    }
});