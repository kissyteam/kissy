/**
 * custom event mechanism for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Target, Event) {
    S.EventTarget = Event.Target = Target;
    return {
        Target: Target
    };
}, {
    requires: ['./custom/target', './base']
});