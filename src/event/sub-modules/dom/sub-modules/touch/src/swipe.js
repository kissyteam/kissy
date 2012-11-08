/**
 * @ignore
 * gesture swipe inspired by sencha touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, Event) {

    var event = 'swipe';

    var MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function Swipe() {
        this.event = event;
    }

    Swipe.prototype = {

        onTouchStart: function (e) {
            var touches = e.touches, touch;
            // single touch(mouse)down/up
            if (touches.length > 1) {
                return false;
            }
            touch = touches[0];
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
            var touches = e.changedTouches,
                touch = touches[0],
                x = touch.pageX,
                y = touch.pageY,
                absDeltaX = Math.abs(x - this.startX),
                absDeltaY = Math.abs(y - this.startY),
                time = e.timeStamp;

            if (time - this.startTime > MAX_DURATION) {
                return false;
            }

            if (this.isVertical && absDeltaX > MAX_OFFSET) {
                this.isVertical = 0;
            }

            if (this.isHorizontal && absDeltaY > MAX_OFFSET) {
                this.isHorizontal = 0;
            }

            if (!this.isHorizontal && !this.isVertical) {
                return false;
            }

        },

        onTouchEnd: function (e) {
            if (this.onTouchMove(e) === false) {
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
                touch: touch,
                direction: direction,
                distance: distance,
                duration: e.timeStamp - this.startTime
            });
        }

    };

    eventHandleMap[event] = Swipe;

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base']
});