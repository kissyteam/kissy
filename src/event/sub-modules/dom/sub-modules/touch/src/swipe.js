/**
 * @ignore
 * gesture swipe inspired by sencha touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, Event, SingleTouch) {

    var event = 'swipe';

    var MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function Swipe() {
        this.requiredTouchCount = 1;
        this.event = event;
    }

    function checkSwipeMove(self, e, touches) {
        var touch = touches[0],
            x = touch.pageX,
            y = touch.pageY,
            absDeltaX = Math.abs(x - self.startX),
            absDeltaY = Math.abs(y - self.startY),
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

        if (!self.isHorizontal && !self.isVertical) {
            return false;
        }

        return undefined;
    }

    S.extend(Swipe, SingleTouch, {

        onTouchStart: function (e) {
            if (Swipe.superclass.onTouchStart.apply(this, arguments) === false) {
                return false;
            }
            var touch = e.touches[0];
            this.startTime = e.timeStamp;

            this.isHorizontal = 1;
            this.isVertical = 1;

            this.startX = touch.pageX;
            this.startY = touch.pageY;

            if (e.type.indexOf('mouse') != -1) {
                e.preventDefault();
            }
        },

        onTouchMove: function (e) {
            // ignore
            if (Swipe.superclass.onTouchMove.apply(this, arguments) === true) {
                return;
            }
            if (checkSwipeMove(this, e, e.touches) == false) {
                return false;
            }
        },

        onTouchEnd: function (e) {
            if (checkSwipeMove(this, e, e.changedTouches) == false) {
                return false;
            }

            var touches = e.changedTouches,
                touch = touches[0],
                x = touch.pageX,
                y = touch.pageY,
                deltaX = x - this.startX,
                deltaY = y - this.startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                distance,
                direction;

            if (this.isVertical && absDeltaY < MIN_DISTANCE) {
                this.isVertical = 0;
            }

            if (this.isHorizontal && absDeltaX < MIN_DISTANCE) {
                this.isHorizontal = 0;
            }

            if (this.isHorizontal) {
                direction = deltaX < 0 ? 'left' : 'right';
                distance = absDeltaX;
            } else if (this.isVertical) {
                direction = deltaY < 0 ? 'up' : 'down';
                distance = absDeltaY;
            } else {
                return false;
            }

            Event.fire(e.target, this.event, {
                /**
                 *
                 * native touch property **only for event swipe**.
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
                 * duration property **only for event swipe**.
                 *
                 * the duration swipe gesture costs
                 * @property {Number} duration
                 * @member KISSY.Event.DOMEventObject
                 */
                duration: e.timeStamp - this.startTime
            });
        }

    });

    eventHandleMap[event] = Swipe;

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base', './base-touch']
});