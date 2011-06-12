KISSY.add("event", function(S, Event, Target,Object) {
    Event.Target = Target;
    Event.Object=Object;
    return Event;
}, {
    requires:[
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/delegate",
        "event/mouseenter"]
});