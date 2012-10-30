/**
 * gesture normalization for pc and touch.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/gesture', function (S) {

    var Features = S.Features, startEvent, moveEvent, endEvent;

    // 不能同时绑定 touchstart 与 mousedown 会导致 iphone 不能选择文本
    if (Features.isTouchSupported) {
        startEvent = 'touchstart';
        moveEvent = 'touchmove';
        endEvent = 'touchend';
    } else if (Features.isMsPointerEnabled) {
        startEvent = 'MSPointerDown';
        moveEvent = 'MSPointerMove';
        endEvent = 'MSPointerUp';
    } else {
        startEvent = 'mousedown';
        moveEvent = 'mousemove';
        endEvent = 'mouseup';
    }

    return {
        startEvent: startEvent,
        moveEvent: moveEvent,
        endEvent: endEvent
    };

});