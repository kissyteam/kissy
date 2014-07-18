/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
/*
combined modules:
event/gesture/edge-pan
*/
KISSY.add('event/gesture/edge-pan', [
    'event/gesture/util',
    'event/dom/base',
    'util'
], function (S, require, exports, module) {
    /**
 * edge drag gesture
 * @author yiminghe@gmail.com
 */
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;
    var DomEvent = require('event/dom/base');
    var SingleTouch = GestureUtil.SingleTouch;
    var EDGE_PAN_START = 'edgePanStart', EDGE_PAN = 'edgePan', EDGE_PAN_END = 'edgePanEnd', MIN_EDGE_DISTANCE = 60;
    var util = require('util');
    function fire(self, e, move) {
        var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, event, direction = self.direction;
        if (!direction) {
            if (absDeltaX > absDeltaY) {
                direction = deltaX < 0 ? 'left' : 'right';
            } else {
                direction = deltaY < 0 ? 'up' : 'down';
            }
            self.direction = direction;
        }
        if (direction === 'up' || direction === 'down') {
            distance = absDeltaY;
        } else {
            distance = absDeltaX;
        }
        var velocityX, velocityY;
        var duration = e.timeStamp - self.startTime;
        if (!move) {
            event = EDGE_PAN_END;
            if (direction === 'left' || direction === 'right') {
                velocityX = distance / duration;
            } else {
                velocityY = distance / duration;
            }
        } else if (self.isStarted) {
            event = EDGE_PAN;
        } else {
            event = EDGE_PAN_START;
            var win = window;
            var invalidRegion = {
                    left: win.pageXOffset + MIN_EDGE_DISTANCE,
                    right: win.pageXOffset + win.innerWidth - MIN_EDGE_DISTANCE,
                    top: win.pageYOffset + MIN_EDGE_DISTANCE,
                    bottom: win.pageYOffset + win.innerHeight - MIN_EDGE_DISTANCE
                };
            if (direction === 'right' && x > invalidRegion.left) {
                return false;
            } else if (direction === 'left' && x < invalidRegion.right) {
                return false;
            } else if (direction === 'down' && y > invalidRegion.top) {
                return false;
            } else if (direction === 'up' && y < invalidRegion.bottom) {
                return false;
            }
            self.isStarted = 1;
            self.startTime = e.timeStamp;
        }    /**
     * fired when edge drag started
     * @event EDGE_PAN_START
     * @member KISSY.Event.Gesture.EdgeDrag
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch and start touch
     * @param {Number} e.duration time duration between current touch and start touch
     * @param {Number} e.velocityX velocity at x-axis
     * @param {Number} e.velocityY velocity at y-axis
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
             /**
     * fired when edge drag
     * @event EDGE_PAN
     * @member KISSY.Event.Gesture.EdgeDrag
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch and start touch
     * @param {Number} e.duration time duration between current touch and start touch
     * @param {Number} e.velocityX velocity at x-axis
     * @param {Number} e.velocityY velocity at y-axis
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
             /**
     * fired when edge drag gesture is finished
     * @event EDGE_PAN_END
     * @member KISSY.Event.Gesture.EdgeDrag
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch and start touch
     * @param {Number} e.duration time duration between current touch and start touch
     * @param {Number} e.velocityX velocity at x-axis
     * @param {Number} e.velocityY velocity at y-axis
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        /**
     * fired when edge drag started
     * @event EDGE_PAN_START
     * @member KISSY.Event.Gesture.EdgeDrag
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch and start touch
     * @param {Number} e.duration time duration between current touch and start touch
     * @param {Number} e.velocityX velocity at x-axis
     * @param {Number} e.velocityY velocity at y-axis
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        /**
     * fired when edge drag
     * @event EDGE_PAN
     * @member KISSY.Event.Gesture.EdgeDrag
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch and start touch
     * @param {Number} e.duration time duration between current touch and start touch
     * @param {Number} e.velocityX velocity at x-axis
     * @param {Number} e.velocityY velocity at y-axis
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        /**
     * fired when edge drag gesture is finished
     * @event EDGE_PAN_END
     * @member KISSY.Event.Gesture.EdgeDrag
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch and start touch
     * @param {Number} e.duration time duration between current touch and start touch
     * @param {Number} e.velocityX velocity at x-axis
     * @param {Number} e.velocityY velocity at y-axis
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        DomEvent.fire(touch.target, event, {
            originalEvent: e.originalEvent,
            pageX: touch.pageX,
            pageY: touch.pageY,
            which: 1,
            direction: direction,
            distance: distance,
            duration: duration / 1000,
            velocityX: velocityX,
            velocityY: velocityY
        });
        return undefined;
    }
    function EdgeDrag() {
    }
    util.extend(EdgeDrag, SingleTouch, {
        requiredGestureType: 'touch',
        start: function () {
            var self = this;
            EdgeDrag.superclass.start.apply(self, arguments);
            var touch = self.lastTouches[0];
            self.direction = null;
            self.startX = touch.pageX;
            self.startY = touch.pageY;
        },
        move: function (e) {
            EdgeDrag.superclass.move.apply(this, arguments);
            return fire(this, e, 1);
        },
        end: function (e) {
            EdgeDrag.superclass.end.apply(this, arguments);
            return fire(this, e, 0);
        }
    });
    addGestureEvent([
        EDGE_PAN,
        EDGE_PAN_END,
        EDGE_PAN_START
    ], { handle: new EdgeDrag() });
    module.exports = {
        EDGE_PAN: EDGE_PAN,
        EDGE_PAN_START: EDGE_PAN_START,
        EDGE_PAN_END: EDGE_PAN_END
    };    /*
 note:
 - android chrome will fire touchcancel before touchmove ....

 refer:
 - http://msdn.microsoft.com/zh-cn/library/windows/apps/hh465415.aspx
 */
});


