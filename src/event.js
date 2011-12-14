/**
 * KISSY Scalable Event Framework
 * @author yiminghe@gmail.com
 */
KISSY.add("event", function (S, _protected, KeyCodes, Event, Target, Object) {
    S.mix(Event, {
        KeyCodes:KeyCodes,
        Target:Target,
        Object:Object,
        on:Event.add,
        detach:Event.remove,
        delegate:function (targets, eventType, selector, fn, scope) {
            return Event.add(targets, eventType, {
                fn:fn,
                scope:scope,
                selector:selector
            });
        },
        undelegate:function (targets, eventType, selector, fn, scope) {
            return Event.remove(targets, eventType, {
                fn:fn,
                scope:scope,
                selector:selector
            });
        }
    });

    S.mix(Event, _protected);

    return Event;
}, {
    requires:[
        "event/protected",
        "event/keycodes",
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/mouseenter",
        "event/submit",
        "event/change",
        "event/mousewheel",
        "event/add",
        "event/remove"
    ]
});