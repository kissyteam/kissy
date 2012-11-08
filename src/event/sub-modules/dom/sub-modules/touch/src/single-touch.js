/**
 * single touch guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch', function (S) {

    function SingleTouch() {
    }

    SingleTouch.prototype = {
        onTouchStart: function (e) {
            var touches = e.touches;
            // single touch(mouse)down/up
            if (touches.length > 1) {
                return false;
            }
        },
        onTouchMove: S.noop,
        onTouchEnd: S.noop
    };

    return SingleTouch;
});