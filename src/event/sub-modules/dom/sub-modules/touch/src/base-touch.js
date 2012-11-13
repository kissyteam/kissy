/**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/base-touch', function (S, DOM) {

    function BaseTouch() {
        this.requiredTouchCount = 1;
    }

    BaseTouch.prototype = {
        onTouchStart: function (e) {
            if (e.touches.length != this.requiredTouchCount) {
                return false;
            }
            this.lastTouches= e.touches;
        },
        onTouchMove: function (e) {
            // ignore current move
            if (e.touches.length != this.requiredTouchCount) {
                return false;
            }
            this.lastTouches= e.touches;
        },
        getCommonTarget: function (e) {
            var touches = e.touches,
                t1 = touches[0].target,
                t2 = touches[1].target;
            if (t1 == t2) {
                return t1;
            }
            if (DOM.contains(t1, t2)) {
                return t1;
            }

            while (1) {
                if (DOM.contains(t2, t1)) {
                    return t2;
                }
                t2 = t2.parentNode;
            }
            S.error('getCommonTarget error!');
            return undefined;
        },
        onTouchEnd: S.noop
    };

    return BaseTouch;

}, {
    requires: ['dom']
});