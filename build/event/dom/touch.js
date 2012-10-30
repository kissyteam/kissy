/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 31 00:14
*/
/**
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch', function (S, EventDomBase) {

    var Gesture = EventDomBase.Gesture,
        Features = S.Features,
        startEvent,
        moveEvent,
        endEvent;

    // 不能同时绑定 touchstart 与 mousedown 会导致 iphone 不能选择文本
    // bind mousedown to turn element into clickable element
    if (Features.isTouchSupported) {
        startEvent = 'touchstart';
        moveEvent = 'touchmove';
        endEvent = 'touchend';
    } else if (Features.isMsPointerEnabled) {
        startEvent = 'MSPointerDown';
        moveEvent = 'MSPointerMove';
        endEvent = 'MSPointerUp';
    }

    // force to load event/dom/touch in pc to use mouse to simulate touch
    if (startEvent) {
        Gesture.startEvent = startEvent;
        Gesture.moveEvent = moveEvent;
        Gesture.endEvent = endEvent;
    }

}, {
    requires: ['event/dom/base']
});
