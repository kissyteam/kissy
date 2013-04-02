/**
 * @ignore
 * gesture swipe inspired by sencha touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, Event, SingleTouch) {

    var event = 'swipe', ingEvent = 'swiping';

    var MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function fire(self, e, ing) {
        var touches = e.changedTouches,
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

        Event.fire(e.target, ing ? ingEvent : event, {
            originalEvent: e.originalEvent,
            /**
             *
             * native touch property **only for touch event**.
             *
             * @property touch
             * @member KISSY.Event.DOMEventObject
             */
            touch: touch,
            /**
             *
             * direction property **only for event swipe/singleTap/doubleTap**.
             *
             * can be one of 'up' 'down' 'left' 'right'
             * @property {String} direction
             * @member KISSY.Event.DOMEventObject
             */
            direction: direction,
            /**
             *
             * distance property **only for event swipe**.
             *
             * the distance swipe gesture costs
             * @property {Number} distance
             * @member KISSY.Event.DOMEventObject
             */
            distance: distance,
            /**
             *
             * duration property **only for touch event**.
             *
             * the duration swipe gesture costs
             * @property {Number} duration
             * @member KISSY.Event.DOMEventObject
             */
            duration: (e.timeStamp - self.startTime) / 1000
        });

        return undefined;
    }

    function Swipe() {
    }

    S.extend(Swipe, SingleTouch, {

        onTouchStart: function (e) {
            var self = this;
            if (Swipe.superclass.onTouchStart.apply(self, arguments) === false) {
                return false;
            }
            var touch = e.touches[0];
            self.startTime = e.timeStamp;

            self.isHorizontal = 1;
            self.isVertical = 1;

            self.startX = touch.pageX;
            this.startY = touch.pageY;

            if (e.type.indexOf('mouse') != -1) {
                e.preventDefault();
            }
            return undefined;
        },

        onTouchMove: function (e) {
            var self = this,
                touch = e.changedTouches[0],
                x = touch.pageX,
                y = touch.pageY,
                deltaX = x - self.startX,
                deltaY = y - self.startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                time = e.timeStamp;

            if (time - self.startTime > MAX_DURATION) {
                return false;
            }

            if (self.isVertical && absDeltaX > MAX_OFFSET) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaY > MAX_OFFSET) {
                self.isHorizontal = 0;
            }

            return fire(self, e, 1);
        },

        onTouchEnd: function (e) {
            var self = this;
            if (self.onTouchMove(e) === false) {
                return false;
            }

            return fire(self, e, 0);
        }

    });

    eventHandleMap[event] = eventHandleMap[ingEvent] = {
        handle: new Swipe()
    };

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch']
});