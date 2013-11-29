/**
 * @ignore
 * multi-touch base
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom');

    function MultiTouch() {
    }

    MultiTouch.prototype = {
        constructor: MultiTouch,

        requiredTouchCount: 2,

        onTouchStart: function (e) {
            var self = this,
                requiredTouchesCount = self.requiredTouchCount,
                touches = e.touches,
                touchesCount = touches.length;
            if (touchesCount === requiredTouchesCount) {
                self.start();
            }
            else if (touchesCount > requiredTouchesCount) {
                self.end(e);
            }
        },

        onTouchEnd: function (e) {
            this.end(e);
        },

        start: function () {
            var self = this;
            if (!self.isTracking) {
                self.isTracking = true;
                self.isStarted = false;
            }
        },

        fireEnd: S.noop,

        getCommonTarget: function (e) {
            var touches = e.touches,
                t1 = touches[0].target,
                t2 = touches[1].target;
            if (t1 === t2) {
                return t1;
            }
            if (Dom.contains(t1, t2)) {
                return t1;
            }

            while (1) {
                if (Dom.contains(t2, t1)) {
                    return t2;
                }
                t2 = t2.parentNode;
            }
            S.error('getCommonTarget error!');
            return undefined;
        },

        end: function (e) {
            var self = this;
            // finger1 down, finger2 down -> start multi touch
            // move finger1 or finger2 -> multi-touch move
            // finger2 up -> end multi touch
            // finger1 move -> ignore
            if (self.isTracking) {
                self.isTracking = false;

                if (self.isStarted) {
                    self.isStarted = false;
                    self.fireEnd(e);
                }
            }
        }
    };

    return MultiTouch;
});