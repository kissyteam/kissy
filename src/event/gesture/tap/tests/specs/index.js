
    var Feature = require('feature');
    if (!require('ua').phantomjs && Feature.isTouchEventSupported()) {
        require('./double-tap');
        require('./tap');
        require('./tap-hold');
    }