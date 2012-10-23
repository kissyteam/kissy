/**
 * custom event mechanism for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/custom-event', function (S) {

    function BaseCustomEvent(cfg) {
        S.mix(this, cfg);
        self.reset();
    }

    BaseCustomEvent.prototype = {

        constructor: BaseCustomEvent,

        hasSubscriber: function () {
            return !!this.subscribers;
        },

        reset: function () {
            var self = this;
            self.subscribers = [];
        },

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