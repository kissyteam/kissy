/**
 * @ignore
 * @fileOverview dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base', function (S, Event, KeyCodes, _DOMUtils, Gesture, Special) {
    S.mix(Event, {
        KeyCodes: KeyCodes,
        _DOMUtils: _DOMUtils,
        Gesture: Gesture,
        _Special: Special
    });
    return Event;
}, {
    requires: ['event/base',
        './base/key-codes',
        './base/utils',
        './base/gesture',
        './base/special',
        './base/api',
        './base/change',
        './base/submit',
        './base/focusin',
        './base/hashchange',
        './base/mouseenter',
        './base/mousewheel',
        './base/valuechange']
});

