/**
 * @ignore
 * @fileOverview dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom', function (S, Event, KeyCodes) {
    S.mix(Event, {
        KeyCodes: KeyCodes
    });
    return Event;
}, {
    requires: ['./base',
        './dom/key-codes',
        './dom/api',
        './dom/change',
        './dom/focusin',
        './dom/hashchange',
        './dom/mouseenter',
        './dom/mousewheel',
        './dom/valuechange']
});

