/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Target = require('./custom/target');
    var util = require('util');
    return {
        Target: Target,

        /**
         * global event target
         * @property {KISSY.Event.CustomEvent.Target} global
         * @member KISSY.Event.CustomEvent
         */
        global: util.mix({}, Target)
    };
});