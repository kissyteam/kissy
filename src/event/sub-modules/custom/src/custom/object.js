/**
 * @ignore
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var BaseEvent = require('event/base');
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
        S.mix(this, data);
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

    S.extend(CustomEventObject, BaseEvent.Object);

    return CustomEventObject;
});