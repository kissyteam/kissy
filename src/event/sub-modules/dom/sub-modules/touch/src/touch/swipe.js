/**
 * @ignore
 * gesture swipe
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var eventHandleMap = require('./handle-map');
    var DomEvent = require('event/dom/base');
    var SingleTouch = require('./single-touch');
    var event = 'swipe',
        ingEvent = 'swiping',
        MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function fire(self, e, ing) {
        var touches = self.lastTouches,
            touch = touches[0],
            x = touch.pageX,
            y = touch.pageY,
            deltaX = x - self.startX,
            deltaY = y - self.startY,
            absDeltaX = Math.abs(deltaX),
            absDeltaY = Math.abs(deltaY),
            distance,
            direction;

        if (ing) {
            if (self.isVertical && self.isHorizontal) {
                // allow little deviation
                if (Math.max(absDeltaX, absDeltaY) < 5) {
                    return undefined;
                }

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

        DomEvent.fire(touch.target, ing ? ingEvent : event, {
            originalEvent: e.originalEvent,

            pageX: touch.pageX,

            pageY: touch.pageY,

            which: 1,
            /**
             *
             * native touch property **only for touch event**.
             *
             * @property touch
             * @member KISSY.Event.DomEvent.Object
             */
            touch: touch,
            /**
             *
             * direction property **only for event swipe/singleTap/doubleTap**.
             *
             * can be one of 'up' 'down' 'left' 'right'
             * @property {String} direction
             * @member KISSY.Event.DomEvent.Object
             */
            direction: direction,
            /**
             *
             * distance property **only for event swipe**.
             *
             * the distance swipe gesture costs
             * @property {Number} distance
             * @member KISSY.Event.DomEvent.Object
             */
            distance: distance,
            /**
             *
             * duration property **only for touch event**.
             *
             * the duration swipe gesture costs
             * @property {Number} duration
             * @member KISSY.Event.DomEvent.Object
             */
            duration: (e.timeStamp - self.startTime) / 1000
        });

        return undefined;
    }

    function Swipe() {
    }

    S.extend(Swipe, SingleTouch, {
        start: function (e) {
            if(!e.isTouch){
                return false;
            }

            var self = this;
            Swipe.superclass.start.apply(self, arguments);
            self.isStarted = true;

            var touch = self.lastTouches[0];

            self.isHorizontal = 1;
            self.isVertical = 1;

            self.startX = touch.pageX;
            self.startY = touch.pageY;
        },

        move: function (e) {
            var self = this,
                time = e.timeStamp;

            Swipe.superclass.move.apply(self, arguments);

            if (time - self.startTime > MAX_DURATION) {
                return false;
            }

            var touch = self.lastTouches[0],
                x = touch.pageX,
                y = touch.pageY,
                deltaX = x - self.startX,
                deltaY = y - self.startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY);

            if (self.isVertical && absDeltaX > MAX_OFFSET) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaY > MAX_OFFSET) {
                self.isHorizontal = 0;
            }

            return fire(self, e, 1);
        },

        end: function (e) {
            var self = this;
            if (self.move(e) === false) {
                return false;
            }
            return fire(self, e, 0);
        }
    });

    eventHandleMap[event] = eventHandleMap[ingEvent] = {
        handle: new Swipe()
    };

    return Swipe;
});