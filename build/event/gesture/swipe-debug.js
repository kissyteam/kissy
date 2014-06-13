/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:51
*/
/*
combined modules:
event/gesture/swipe
*/
KISSY.add('event/gesture/swipe', [
    'event/gesture/util',
    'event/dom/base',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * gesture swipe
 * @author yiminghe@gmail.com
 */
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;
    var DomEvent = require('event/dom/base');
    var SingleTouch = GestureUtil.SingleTouch;
    var SWIPE = 'swipe', SWIPE_START = 'swipeStart', SWIPE_END = 'swipeEnd', MAX_DURATION = 1000, MAX_OFFSET = 35, MIN_DISTANCE = 50;
    var util = require('util');
    function fire(self, e, ing) {
        var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, time = e.timeStamp, direction;
        if (time - self.startTime > MAX_DURATION) {
            return false;
        }
        if (self.isVertical && absDeltaX > MAX_OFFSET) {
            self.isVertical = 0;
        }
        if (self.isHorizontal && absDeltaY > MAX_OFFSET) {
            self.isHorizontal = 0;
        }
        if (ing) {
            if (self.isVertical && self.isHorizontal) {
                if (absDeltaY > absDeltaX) {
                    self.isHorizontal = 0;
                } else {
                    self.isVertical = 0;
                }
            }
        } else {
            if (self.isVertical && absDeltaY < MIN_DISTANCE) {
                self.isVertical = 0;
            }
            if (self.isHorizontal && absDeltaX < MIN_DISTANCE) {
                self.isHorizontal = 0;
            }
        }
        if (self.isHorizontal) {
            direction = deltaX < 0 ? 'left' : 'right';
            distance = absDeltaX;
        } else if (self.isVertical) {
            direction = deltaY < 0 ? 'up' : 'down';
            distance = absDeltaY;
        } else {
            return false;
        }
        var event;
        if (!ing) {
            event = SWIPE_END;
        } else if (direction && !self.isStarted) {
            self.isStarted = 1;
            event = SWIPE_START;
        } else {
            event = SWIPE;
        }    /**
     * fired when swipe.
     * preventDefault this event to prevent native behavior
     * @event SWIPE
     * @member KISSY.Event.Gesture.Swipe
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
             /**
     * fired when swipe gesture is finished.
     * preventDefault this event to prevent native behavior
     * @event SWIPE_END
     * @member KISSY.Event.Gesture.Swipe
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
             /**
     * fired when swipe started.
     * preventDefault this event to prevent native behavior
     * @event SWIPE_START
     * @member KISSY.Event.Gesture.Swipe
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        /**
     * fired when swipe.
     * preventDefault this event to prevent native behavior
     * @event SWIPE
     * @member KISSY.Event.Gesture.Swipe
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        /**
     * fired when swipe gesture is finished.
     * preventDefault this event to prevent native behavior
     * @event SWIPE_END
     * @member KISSY.Event.Gesture.Swipe
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        /**
     * fired when swipe started.
     * preventDefault this event to prevent native behavior
     * @event SWIPE_START
     * @member KISSY.Event.Gesture.Swipe
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        DomEvent.fire(touch.target, event, {
            originalEvent: e.originalEvent,
            pageX: touch.pageX,
            pageY: touch.pageY,
            which: 1,
            direction: direction,
            distance: distance,
            duration: (e.timeStamp - self.startTime) / 1000
        });
        return undefined;
    }
    function Swipe() {
    }
    util.extend(Swipe, SingleTouch, {
        requiredGestureType: 'touch',
        start: function () {
            var self = this;
            Swipe.superclass.start.apply(self, arguments);
            var touch = self.lastTouches[0];
            self.isHorizontal = 1;
            self.isVertical = 1;
            self.startX = touch.pageX;
            self.startY = touch.pageY;
        },
        move: function (e) {
            Swipe.superclass.move.apply(this, arguments);
            return fire(this, e, 1);
        },
        end: function (e) {
            Swipe.superclass.end.apply(this, arguments);
            return fire(this, e, 0);
        }
    });
    addGestureEvent([
        SWIPE,
        SWIPE_START,
        SWIPE_END
    ], { handle: new Swipe() });
    module.exports = {
        SWIPE: SWIPE,
        SWIPE_START: SWIPE_START,
        SWIPE_END: SWIPE_END
    };
});


