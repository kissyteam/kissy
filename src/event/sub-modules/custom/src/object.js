/**
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/object', function (S, Event) {

    function CustomEventObject(data) {
        S.mix(this, data);
    }

    S.extend(CustomEventObject, Event._Object);

    return CustomEventObject;

}, {
    requires: ['event/base']
});