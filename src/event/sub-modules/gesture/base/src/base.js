/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('event/dom/base');
    var addGestureEvent = require('./base/add-event');

    var Enumeration = {
        start: 'gestureStart',
        START: 'gestureStart',
        move: 'gestureMove',
        MOVE: 'gestureMove',
        end: 'gestureEnd',
        END: 'gestureEnd'
    };

    function addGestureBaseEvent(event, onHandler) {
        var handle = {
            // always fire
            isActive: 1
        };
        handle[onHandler] = function (e) {
            DomEvent.fire(e.target, event, e);
        };
        addGestureEvent(event, {
            // fired first if registered
            order: 1,
            handle: handle
        });
    }

    addGestureBaseEvent(Enumeration.START, 'onTouchStart');
    addGestureBaseEvent(Enumeration.MOVE, 'onTouchMove');
    addGestureBaseEvent(Enumeration.END, 'onTouchEnd');

    S.mix(Enumeration, require('./base/tap'));

    return {
        Enumeration: Enumeration,
        addEvent: addGestureEvent,
        Touch: require('./base/touch'),
        SingleTouch: require('./base/single-touch')
    };
});

/*
 yiminghe@gmail.com - 2014-03-13
 - enumeration should be uppercase. deprecated lower case
 */