/**
 * @ignore
 * dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base', function (S, DomEvent, DomEventObject, KeyCode, Gesture, Special) {
    return S.merge({
        add: DomEvent.on,
        remove: DomEvent.detach,
        KeyCode: KeyCode,
        Gesture: Gesture,
        Special: Special,
        Object: DomEventObject
    }, DomEvent);
}, {
    requires: [
        './base/dom-event',
        './base/object',
        './base/key-codes',
        './base/gesture',
        './base/special-events',
        './base/mouseenter',
        './base/valuechange']
});

