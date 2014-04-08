/**
 * utils for gesture events
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var addGestureEvent = require('./util/add-event');

    return {
        addEvent: addGestureEvent,
        Touch: require('./util/touch'),
        SingleTouch: require('./util/single-touch'),
        DoubleTouch: require('./util/double-touch')
    };
});