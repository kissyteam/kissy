/**
 * @ignore
 * touch base
 * @author yiminghe@gmail.com
 */
var noop = function () {
};

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
            self.startTime = e.timeStamp;
            return self.start(e);
        } else if (touchesCount > requiredTouchesCount) {
            // if more or less touches are triggered, then end
            self.onTouchEnd(e, true);
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

    onTouchEnd: function (e, moreTouches) {
        var self = this;
        // finger1 down, finger2 down -> start multi touch
        // move finger1 or finger2 -> double-touch move
        // finger2 up -> end multi touch
        // finger1 move -> ignore
        if (self.isTracking) {
            self.isTracking = false;
            if (self.isStarted) {
                self.isStarted = false;
                self.end(e, moreTouches);
            }
        }
    },

    start: noop,

    move: noop,

    end: noop
};

module.exports = Touch;