/**
 * utils for gesture events
 * @author yiminghe@gmail.com
 */
var addGestureEvent = require('./util/add-event');

module.exports = {
    addEvent: addGestureEvent,
    Touch: require('./util/touch'),
    SingleTouch: require('./util/single-touch'),
    DoubleTouch: require('./util/double-touch')
};