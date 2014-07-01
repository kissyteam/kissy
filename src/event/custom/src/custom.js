/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
var Target = require('./custom/target');
var util = require('util');
module.exports = {
    Target: Target,

    Object: require('./custom/object'),

    /**
     * global event target
     * @property {KISSY.Event.CustomEvent.Target} global
     * @member KISSY.Event.CustomEvent
     */
    global: util.mix({}, Target)
};