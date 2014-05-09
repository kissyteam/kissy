/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:03
*/
/*
combined modules:
event/gesture/base
*/
/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/gesture/base', [
    'event/dom/base',
    'event/gesture/util'
], function (S, require) {
    var DomEvent = require('event/dom/base');
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;
    var BaseGesture = {
            START: 'ksGestureStart',
            MOVE: 'ksGestureMove',
            END: 'ksGestureEnd'
        };
    function addBaseGestureEvent(event, onHandler) {
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
    addBaseGestureEvent(BaseGesture.START, 'onTouchStart');
    addBaseGestureEvent(BaseGesture.MOVE, 'onTouchMove');
    addBaseGestureEvent(BaseGesture.END, 'onTouchEnd');
    return BaseGesture;
});    /*
 yiminghe@gmail.com - 2014-03-13
 - enumeration should be uppercase. deprecated lower case
 */

