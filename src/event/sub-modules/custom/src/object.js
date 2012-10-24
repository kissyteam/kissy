/**
 * @ignore
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/object', function (S, Event) {

    /**
     * Custom event object
     * @class KISSY.Event.CustomEventObject
     * @param {Object} data data which will be mixed into custom event instance
     * @extends KISSY.Event.Object
     */
    function CustomEventObject(data) {
        S.mix(this, data);
        /**
         * source target of current event
         * @cfg {KISSY.Event.Target} target
         */
        /**
         * current target which processes current event
         * @cfg {KISSY.Event.Target} currentTarget
         */
    }

    S.extend(CustomEventObject, Event._Object);

    return CustomEventObject;

}, {
    requires: ['event/base']
});