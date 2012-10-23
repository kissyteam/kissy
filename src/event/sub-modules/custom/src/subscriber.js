/**
 * Subscriber for custom event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/subscriber', function (S, Subscriber) {


    function CustomSubscriber() {
        CustomSubscriber.superclass.constructor.apply(this, arguments);
    }

    S.extend(CustomSubscriber, Subscriber, {

        keys:['fn','scope']

    });

    return CustomSubscriber;

}, {
    requires: ['event/base/subscriber']
});