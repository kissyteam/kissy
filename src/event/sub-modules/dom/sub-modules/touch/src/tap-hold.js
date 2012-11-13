/**
 * @ignore
 * fired when tap and hold for more than 1s
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap-hold', function (S, eventHandleMap, BaseTouch, Event) {
    var event = 'tapHold';

    var duration = 1000;

    function TapHold() {
        this.requiredTouchCount = 1;
    }

    S.extend(TapHold, BaseTouch, {
        onTouchStart: function (e) {
            var self = this;
            if (TapHold.superclass.onTouchStart.call(self, e) === false) {
                return false;
            }
            self.timer = setTimeout(function () {
                Event.fire(e.target, event, {
                    touch: e.touches[0],
                    duration: (S.now() - e.timeStamp)
                });
            }, duration);
        },

        onTouchMove: function () {
            clearTimeout(this.timer);
            return false;
        },

        onTouchEnd: function () {
            clearTimeout(this.timer);
        }
    });

    eventHandleMap[event] = TapHold;

    return TapHold;

}, {
    requires: ['./handle-map', './base-touch', 'event/dom/base']
});