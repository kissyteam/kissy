/**
 * @ignore
 * Subscriber for custom event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/subscriber', function (S, Event) {

    /**
     * Subscriber for custom event
     * @class KISSY.Event.CustomSubscriber
     * @extends KISSY.Event.Subscriber
     */
    function CustomSubscriber() {
        CustomSubscriber.superclass.constructor.apply(this, arguments);
    }

    S.extend(CustomSubscriber, Event._Subscriber, {

        keys:['fn','context']

    });

    return CustomSubscriber;

}, {
    requires: ['event/base']
});