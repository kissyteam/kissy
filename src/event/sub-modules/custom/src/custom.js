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
        global: new Target(),

        /**
         * object of Target for KISSY.mix
         * @property {KISSY.Event.CustomEvent.Target} targetObject
         * @member KISSY.Event.CustomEvent
         */
        targetObject: S.mix({}, Target.prototype, true, function (k, v) {
            return k == 'constructor' ? undefined : v;
        })
    };
}, {
    requires: ['./custom/target']
});