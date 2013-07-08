/**
 * @ignore
 * patch gesture for touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/gesture', function (S, DomEvent) {

    var Gesture = DomEvent.Gesture,
        Features = S.Features,
        startEvent,
        moveEvent,
        cancelEvent,
        endEvent;

    // 不能同时绑定 touchstart 与 mousedown 会导致 ios 不能选择文本
    // bind mousedown to turn element into clickable element
    if (Features.isTouchEventSupported()) {
        startEvent = 'touchstart';
        moveEvent = 'touchmove';
        endEvent = 'touchend';
        cancelEvent = 'touchcancel';
    }


    else if (Features.isMsPointerSupported()) {
        startEvent = 'MSPointerDown';
        moveEvent = 'MSPointerMove';
        endEvent = 'MSPointerUp';
        cancelEvent = 'MSPointerCancel';
    }

    // force to load event/dom/touch in pc to use mouse to simulate touch
    if (startEvent) {
        Gesture.start = startEvent;
        Gesture.move = moveEvent;
        Gesture.end = endEvent;
        Gesture.cancel = cancelEvent;
        Gesture.tap = 'tap';
        Gesture.doubleTap = 'doubleTap';
        Gesture.singleTouchStart = 'singleTouchStart';
    }

    return Gesture;

}, {
    requires: ['event/dom/base']
});