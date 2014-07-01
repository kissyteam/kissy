/**
 * @ignore
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
var BaseEvent = require('event/base');
var util = require('util');

/**
 * Do not new by yourself.
 *
 * Custom event object.
 * @private
 * @class KISSY.Event.CustomEvent.Object
 * @param {Object} data data which will be mixed into custom event instance
 * @extends KISSY.Event.Object
 */
function CustomEventObject(data) {
    CustomEventObject.superclass.constructor.call(this);
    util.mix(this, data);
    /**
     * source target of current event
     * @property  target
     * @type {KISSY.Event.CustomEvent.Target}
     */
    /**
     * current target which processes current event
     * @property currentTarget
     * @type {KISSY.Event.CustomEvent.Target}
     */
}

util.extend(CustomEventObject, BaseEvent.Object);

module.exports = CustomEventObject;