/**
 * @ignore
 * singleTouchStart event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch-start', function (S, eventHandleMap, Event, SingleTouch) {

    var event = 'singleTouchStart';

    function SingleTouchStart() {
    }

    S.extend(SingleTouchStart, SingleTouch, {

        onTouchStart: function (e) {
            if (SingleTouchStart.superclass.onTouchStart.apply(this, arguments) !== false) {
                Event.fire(e.target, event, {
                    touch: e.touches[0],
                    touches: e.touches
                });
                return undefined;
            }
            return false;
        }

    });

    eventHandleMap[event] = {
        handle: new SingleTouchStart()
    };

    return SingleTouchStart;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch']
});

/**
 * for draggable:
 * listen singleTouchStart insteadof native touchstart in case inner element call stopPropagation
 */