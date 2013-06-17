/**
 * event facade for event module.contains custom dom and touch event
 */
KISSY.add('event', function (S, DOMEvent, CustomEvent) {

    // compatibility

    S.EventTarget = CustomEvent.Target;

    return S.Event = S.merge(DOMEvent, CustomEvent);

}, {
    requires: ['event/dom', 'event/custom']
});