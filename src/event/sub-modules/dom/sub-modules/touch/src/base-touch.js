/**
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/base-touch', function (S) {

    function BaseTouch() {
        this.requiredTouchCount = 1;
    }

    BaseTouch.prototype = {
        onTouchStart: function (e) {
            if (e.touches.length != this.requiredTouchCount) {
                return false;
            }
        },
        onTouchMove: function (e) {
            // ignore current move
            if (e.touches.length != this.requiredTouchCount) {
                return false;
            }
        },
        onTouchEnd: S.noop
    };

    return BaseTouch;

});