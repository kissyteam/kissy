/**
 * @ignore
 * gesture pinch
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var eventHandleMap = require('./handle-map');
    var DomEvent = require('event/dom/base');
    var MultiTouch = require('./multi-touch');

    var PINCH = 'pinch',
        PINCH_START = 'pinchStart',
        PINCH_END = 'pinchEnd';

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function Pinch() {
    }

    S.extend(Pinch, MultiTouch, {
        onTouchMove: function (e) {
            var self = this;

            if (!self.isTracking) {
                return;
            }

            var touches = e.touches;

            // error report in android 2.3
            if (!(touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0)) {
                return;
            }

            var distance = getDistance(touches[0], touches[1]);

            self.lastTouches = touches;

            if (!self.isStarted) {
                self.isStarted = true;
                self.startDistance = distance;
                var target = self.target = self.getCommonTarget(e);
                DomEvent.fire(target,
                    PINCH_START, S.mix(e, {
                        distance: distance,
                        scale: 1
                    }));
            } else {
                DomEvent.fire(self.target,
                    PINCH, S.mix(e, {
                        distance: distance,
                        scale: distance / self.startDistance
                    }));
            }
        },

        fireEnd: function (e) {
            var self = this;
            DomEvent.fire(self.target, PINCH_END, S.mix(e, {
                touches: self.lastTouches
            }));
        }
    });

    var p = new Pinch();

    eventHandleMap[PINCH_START] =
        eventHandleMap[PINCH_END] = {
            handle: p
        };

    function prevent(e) {
        if (e.targetTouches.length === 2) {
            e.preventDefault();
        }
    }

    var config = eventHandleMap[PINCH] = {
        handle: p
    };
    if (S.Features.isTouchEventSupported()) {
        config.setup = function () {
            this.addEventListener('touchmove', prevent, false);
        };
        config.tearDown = function () {
            this.removeEventListener('touchmove', prevent, false);
        };
    }

    return Pinch;
});