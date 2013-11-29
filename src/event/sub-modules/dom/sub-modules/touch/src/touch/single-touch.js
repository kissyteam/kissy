/**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    function SingleTouch() {
    }

    SingleTouch.prototype = {
        constructor: SingleTouch,
        requiredTouchCount: 1,
        onTouchStart: function (e) {
            var self = this,
                touches;
            if (e.touches.length !== self.requiredTouchCount) {
                return false;
            }
            touches = self.lastTouches = e.touches;
            // ios will share touches with touchmove...
            self.lastXY = {
                pageX: touches[0].pageX,
                pageY: touches[0].pageY
            };
            return undefined;
        },
        onTouchMove: S.noop,
        onTouchEnd: S.noop
    };

    return SingleTouch;
});