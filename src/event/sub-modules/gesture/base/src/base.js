/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('event/dom/base');
    var addGestureEvent = require('./base/add-event');

    require('./base/tap');

    var Enumeration = {
        tap: 'tap',
        singleTap: 'singleTap',
        doubleTap: 'doubleTap'
    };
    var startEvent = Enumeration.start = 'gestureStart';
    var moveEvent = Enumeration.move = 'gestureMove';
    var endEvent = Enumeration.end = 'gestureEnd';

    addGestureEvent(startEvent, {
        handle: {
            // always fire
            isActive: 1,
            onTouchStart: function (e) {
                DomEvent.fire(e.target, startEvent, e);
            }
        }
    });

    addGestureEvent(moveEvent, {
        handle: {
            // always fire
            isActive: 1,
            onTouchMove: function (e) {
                DomEvent.fire(e.target, moveEvent, e);
            }
        }
    });

    addGestureEvent(endEvent, {
        handle: {
            // always fire
            isActive: 1,
            onTouchEnd: function (e) {
                DomEvent.fire(e.target, endEvent, e);
            }
        }
    });

    return {
        Enumeration: Enumeration,
        addEvent: addGestureEvent,
        Touch: require('./base/touch'),
        SingleTouch: require('./base/single-touch')
    };
});