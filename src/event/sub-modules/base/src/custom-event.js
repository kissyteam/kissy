/**
 * @ignore
 * base custom event mechanism for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/custom-event', function (S) {

    /**
     * base custom event for registering and un-registering subscriber for specified event.
     * @class KISSY.Event.BaseCustomEvent
     * @private
     * @param {Object} cfg custom event's attribute
     */
    function BaseCustomEvent(cfg) {
        var self = this;
        S.mix(self, cfg);
        self.reset();
        /**
         * current event type
         * @cfg {String} type
         */
    }

    BaseCustomEvent.prototype = {

        constructor: BaseCustomEvent,

        /**
         * whether current event has subscribers
         * @return {Boolean}
         */
        hasSubscriber: function () {
            return !!this.subscribers.length;
        },

        /**
         * reset current event's status
         */
        reset: function () {
            var self = this;
            self.subscribers = [];
        },

        /**
         * remove one subscriber from current event's subscribers
         * @param {KISSY.Event.Subscriber} s
         */
        removeSubscriber: function (s) {
            var subscribers = this.subscribers,
                len = subscribers.length;
            for (var i = 0; i < len; i++) {
                if (subscribers[i] == s) {
                    subscribers.splice(i, 1);
                    break;
                }
            }
        },

        /**
         * Search for a specified subscriber within current event's subscribers
         * @param {KISSY.Event.Subscriber} subscriber
         * @return {Number} subscriber's index in subscribers
         */
        findSubscriber: function (subscriber) {
            var subscribers = this.subscribers, i;

            for (i = subscribers.length - 1; i >= 0; --i) {
                /*
                 If multiple identical EventListeners are registered on the same EventTarget
                 with the same parameters the duplicate instances are discarded.
                 They do not cause the EventListener to be called twice
                 and since they are discarded
                 they do not need to be removed with the removeEventListener method.
                 */
                if (subscriber.equals(subscribers[i])) {
                    return i;
                }
            }

            return -1;
        }
    };

    return BaseCustomEvent;

});