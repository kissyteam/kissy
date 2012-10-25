/**
 * @ignore
 * @fileOverview dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom', function (S, Event, KeyCodes, _DOMUtils) {
    S.mix(Event, {
        KeyCodes: KeyCodes,
        _DOMUtils: _DOMUtils
    });
    return Event;
}, {
    requires: ['./base',
        './dom/key-codes',
        './dom/utils',
        './dom/api',
        './dom/change',
        './dom/submit',
        './dom/focusin',
        './dom/hashchange',
        './dom/mouseenter',
        './dom/mousewheel',
        './dom/valuechange']
});

