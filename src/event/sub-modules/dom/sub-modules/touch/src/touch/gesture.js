/**
 * @ignore
 * patch gesture for touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/gesture', function (S, DomEvent) {
    var Gesture = DomEvent.Gesture;
    Gesture.start = 'gestureStart';
    Gesture.move = 'gestureMove';
    Gesture.end = 'gestureEnd';
    Gesture.tap = 'tap';
    Gesture.doubleTap = 'doubleTap';
    return Gesture;
}, {
    requires: ['event/dom/base']
});