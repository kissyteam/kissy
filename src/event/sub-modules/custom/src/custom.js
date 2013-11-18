/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Target) {
    return {
        Target: Target,

        /**
         * global event target
         * @property {KISSY.Event.CustomEvent.Target} global
         * @member KISSY.Event.CustomEvent
         */
        global: S.mix({}, Target)
    };
}, {
    requires: ['./custom/target']
});