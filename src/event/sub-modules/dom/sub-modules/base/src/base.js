/**
 * @ignore
 * dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base', function (S, DOMEvent, KeyCode, Gesture, Special) {
    return S.merge({
        add: DOMEvent.on,
        remove: DOMEvent.detach,
        KeyCode: KeyCode,
        Gesture: Gesture,
        Special: Special
    }, DOMEvent);
}, {
    requires: [
        './base/dom-event',
        './base/key-codes',
        './base/gesture',
        './base/special-events',
        './base/mouseenter',
        './base/valuechange']
});

