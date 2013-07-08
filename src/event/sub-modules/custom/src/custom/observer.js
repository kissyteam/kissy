/**
 * @ignore
 * Observer for custom event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/observer', function (S, BaseEvent) {

    /**
     * Observer for custom event
     * @class KISSY.Event.CustomEventObserver
     * @extends KISSY.Event.Observer
     * @private
     */
    function CustomEventObserver() {
        CustomEventObserver.superclass.constructor.apply(this, arguments);
    }

    S.extend(CustomEventObserver, BaseEvent.Observer, {

        keys:['fn','context','groups']

    });

    return CustomEventObserver;

}, {
    requires: ['event/base']
});