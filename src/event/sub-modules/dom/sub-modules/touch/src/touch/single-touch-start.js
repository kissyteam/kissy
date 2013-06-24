/**
 * @ignore
 * singleTouchStart event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch-start', function (S, eventHandleMap, DOMEvent, SingleTouch) {

    var event = 'singleTouchStart';

    function SingleTouchStart() {
    }

    S.extend(SingleTouchStart, SingleTouch, {

        onTouchStart: function (e) {
            if (SingleTouchStart.superclass.onTouchStart.apply(this, arguments) !== false) {
                var touch= e.touches[0];
                DOMEvent.fire(e.target, event, {
                    touch: touch[0],
                    pageX:touch.pageX,
                    pageY:touch.pageY,
                    which: 1,
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