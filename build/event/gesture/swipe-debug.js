/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
/*
combined modules:
event/gesture/swipe
*/
KISSY.add('event/gesture/swipe', [
    'util',
    'dom',
    'event/gesture/util',
    'event/dom/base'
], function (S, require, exports, module) {
    /**
 * @ignore
 * gesture swipe
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Dom = require('dom');
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;
    var DomEvent = require('event/dom/base');
    var SingleTouch = GestureUtil.SingleTouch;
    var SWIPE = 'swipe', MAX_DURATION = 1000, MAX_OFFSET = 35, MIN_DISTANCE = 50;
    function fire(self, e, ing) {
        var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, direction, time = e.timeStamp;
        self.isStarted = 1;
        if (time - self.startTime > MAX_DURATION) {
            return false;
        }
        if (self.isVertical && absDeltaX > MAX_OFFSET) {
            self.isVertical = 0;
        }
        if (self.isHorizontal && absDeltaY > MAX_OFFSET) {
            self.isHorizontal = 0;
        }
        if (self.isVertical && self.isHorizontal) {
            if (absDeltaY > absDeltaX) {
                self.isHorizontal = 0;
            } else {
                self.isVertical = 0;
            }
        }
        if (!ing) {
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
        if (ing) {
            var prevent = e.originalEvent._ksSwipePrevent;
            if (prevent) {
                if (prevent === true || prevent[direction]) {
                    e.preventDefault();
                }
            }
            return;
        }    /**
     * fired when swipe gesture is finished.
     * preventDefault this event to prevent native behavior
     * @event SWIPE_END
     * @member KISSY.Event.Gesture.SWIPE
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
             // _ksSwipePrevent
        /**
     * fired when swipe gesture is finished.
     * preventDefault this event to prevent native behavior
     * @event SWIPE_END
     * @member KISSY.Event.Gesture.SWIPE
     * @param {KISSY.Event.DomEvent.Object} e
     * @param {Number} e.pageX drag point pageX
     * @param {Number} e.pageY drag point pageY
     * @param {Number} e.distance distance between current touch point and start touch point
     * @param {Number} e.duration time duration(s) between current touch point and start touch point
     * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
     */
        // _ksSwipePrevent
        DomEvent.fire(touch.target, SWIPE, {
            originalEvent: e.originalEvent,
            pageX: touch.pageX,
            pageY: touch.pageY,
            which: 1,
            direction: direction,
            distance: distance,
            duration: (e.timeStamp - self.startTime) / 1000
        });
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
    function matchFilter(target, currentTarget, filter) {
        var ret = false;
        while (target !== currentTarget) {
            ret = Dom.test(target, filter);
            if (ret) {
                break;
            }
            target = target.parentNode;
        }
        return ret;
    }
    addGestureEvent([SWIPE], {
        handle: new Swipe(),
        add: function (observer) {
            var config = observer.config;
            var preventDefault = config.preventDefault;
            if (preventDefault) {
                var filter = config.filter;
                observer._preventFn = function (e) {
                    if (!filter || matchFilter(e.target, e.currentTarget, filter)) {
                        e._ksSwipePrevent = preventDefault;
                    }
                };
                this.addEventListener('touchmove', observer._preventFn);
            }
        },
        remove: function (observer) {
            if (observer._preventFn) {
                this.removeEventListener('touchmove', observer._preventFn);
                observer._preventFn = null;
            }
        }
    });
    module.exports = { SWIPE: SWIPE };
});



