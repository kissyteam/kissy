/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Event, Target) {
    S.EventTarget = Event.Target = Target;
    return {
        Target: Target
    };
}, {
    requires: ['./base', './custom/target']
});