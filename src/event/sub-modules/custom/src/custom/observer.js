/**
 * @ignore
 * Observer for custom event
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var BaseEvent = require('event/base');

    /**
     * Observer for custom event
     * @class KISSY.Event.CustomEvent.Observer
     * @extends KISSY.Event.Observer
     * @private
     */
    function CustomEventObserver() {
        CustomEventObserver.superclass.constructor.apply(this, arguments);
    }

    S.extend(CustomEventObserver, BaseEvent.Observer, {
        keys: ['fn', 'context', 'groups']
    });

    return CustomEventObserver;
});