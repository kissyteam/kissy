/**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch', function (S) {

    function SingleTouch() {
    }

    SingleTouch.prototype = {
        requiredTouchCount: 1,
        onTouchStart: function (e) {
            var self = this;
            if (e.touches.length != self.requiredTouchCount) {
                return false;
            }
            self.lastTouches = e.touches;
            return undefined;
        },
        onTouchMove: S.noop,
        onTouchEnd: S.noop
    };

    return SingleTouch;

});