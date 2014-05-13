/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('event/dom/base');
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;

    var BasicGesture = {
        START: 'ksGestureStart',
        MOVE: 'ksGestureMove',
        END: 'ksGestureEnd'
    };

    function addBasicGestureEvent(event, onHandler) {
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

    addBasicGestureEvent(BasicGesture.START, 'onTouchStart');
    addBasicGestureEvent(BasicGesture.MOVE, 'onTouchMove');
    addBasicGestureEvent(BasicGesture.END, 'onTouchEnd');

    return BasicGesture;
});

/*
 yiminghe@gmail.com - 2014-03-13
 - enumeration should be uppercase. deprecated lower case
 */