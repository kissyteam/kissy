/**
 * @ignore
 * fired when rotate using two fingers
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/rotate', function (S, eventHandleMap, BaseTouch, Event) {
    var ROTATE_START = 'rotateStart',
        ROTATE = 'rotate',
        RAD_2_DEG = 180 / Math.PI,
        ROTATE_END = 'rotateEnd';

    function Rotate() {
        this.requiredTouchCount = 2;
    }

    S.extend(Rotate, BaseTouch, {
        onTouchStart: function (e) {
            var self = this;

            if (Rotate.superclass.onTouchStart.call(self, e) === false) {
                return false;
            }

            var touches = e.touches,
                one = touches[0],
                two = touches[1],
                angle = Math.atan2(two.pageY - one.pageY,
                    two.pageX - one.pageX) * RAD_2_DEG;

            self.lastAngle = self.startAngle = angle;

            self.target = self.getCommonTarget(e);

            Event.fire(self.target, ROTATE_START, {
                touches: e.touches,
                angle: angle,
                rotation: 0
            });
        },

        onTouchMove: function (e) {
            var self = this;

            if (Rotate.superclass.onTouchMove.call(self, e) === false) {
                return false;
            }

            var touches = e.touches,
                one = touches[0],
                two = touches[1],
                lastAngle = self.lastAngle,
                angle = Math.atan2(two.pageY - one.pageY,
                    two.pageX - one.pageX) * RAD_2_DEG;

            var diff = Math.abs(angle - lastAngle);
            var positiveAngle = angle + 360;
            var negativeAngle = angle - 360;

            // process '>' scenario: top -> bottom
            if (Math.abs(positiveAngle - lastAngle) < diff) {
                angle = positiveAngle;
            }
            // process '>' scenario: bottom -> top
            else if (Math.abs(negativeAngle - lastAngle) < diff) {
                angle = negativeAngle;
            }

            self.lastAngle = angle;

            Event.fire(self.target, ROTATE, {
                touches: touches,
                angle: angle,
                rotation: angle - self.startAngle
            });
        },

        onTouchEnd: function () {
            Event.fire(this.target, ROTATE_END, {
                touches: this.lastTouches
            });
        }
    });

    eventHandleMap[ROTATE] = eventHandleMap[ROTATE_END] = eventHandleMap[ROTATE_START] = Rotate;

    return Rotate;

}, {
    requires: ['./handle-map', './base-touch', 'event/dom/base']
});