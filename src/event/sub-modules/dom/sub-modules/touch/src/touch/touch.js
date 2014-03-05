/**
 * @ignore
 * touch base
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    var noop = S.noop;

    function Touch() {
    }

    Touch.prototype = {
        constructor: Touch,

        requiredTouchCount: 0,

        onTouchStart: function (e) {
            var self = this,
                requiredTouchesCount = self.requiredTouchCount,
                touches = e.touches,
                touchesCount = touches.length;
            if (touchesCount === requiredTouchesCount) {
                if (!self.isTracking) {
                    self.isTracking = true;
                    self.isStarted = false;
                }
                // record valid touches
                self.lastTouches = e.touches;
                return self.start(e);
            }
            // if more or less touches are triggered, then end
            else if (touchesCount > requiredTouchesCount) {
                self.onTouchEnd(e);
            }
            return undefined;
        },

        onTouchMove: function (e) {
            var self = this;
            if (!self.isTracking) {
                return undefined;
            }
            // record valid touches
            self.lastTouches = e.touches;
            return self.move(e);
        },

        onTouchEnd: function (e) {
            var self = this;
            // finger1 down, finger2 down -> start multi touch
            // move finger1 or finger2 -> double-touch move
            // finger2 up -> end multi touch
            // finger1 move -> ignore
            if (self.isTracking) {
                self.isTracking = false;
                if (self.isStarted) {
                    self.isStarted = false;
                    self.end(e);
                }
            }
        },

        start: noop,

        move: noop,

        end: noop
    };

    return Touch;
});