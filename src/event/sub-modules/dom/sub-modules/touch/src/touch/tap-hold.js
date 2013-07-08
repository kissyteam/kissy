/**
 * @ignore
 * fired when tap and hold for more than 1s
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap-hold', function (S, eventHandleMap, SingleTouch, DomEvent, Gesture) {
    var event = 'tapHold';

    var duration = 1000;

    function TapHold() {
    }

    S.extend(TapHold, SingleTouch, {
        onTouchStart: function (e) {
            var self = this;
            if (TapHold.superclass.onTouchStart.call(self, e) === false) {
                return false;
            }
            self.timer = setTimeout(function () {
                var touch= e.touches[0];
                DomEvent.fire(e.target, event, {
                    touch: touch,
                    pageX:touch.pageX,
                    pageY:touch.pageY,
                    which: 1,
                    duration: (S.now() - e.timeStamp) / 1000
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

    function prevent(e) {
        if (!e.touches || e.touches.length == 1) {
            e.preventDefault();
        }
    }

    eventHandleMap[event] = {
        setup: function () {
            // prevent native scroll
            DomEvent.on(this, Gesture.start, prevent);
        },
        tearDown: function () {
            DomEvent.detach(this, Gesture.start, prevent);
        },
        handle: new TapHold()
    };

    return TapHold;

}, {
    requires: ['./handle-map', './single-touch', 'event/dom/base', './gesture']
});