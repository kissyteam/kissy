/**
 * @ignore
 * custom event mechanism for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/custom-event', function (S, CustomSubscriber, CustomEventObject, Event) {

    var _Utils = Event._Utils;

    /**
     * custom event for registering and un-registering subscriber for specified event on normal object.
     * @class KISSY.Event.CustomEvent
     * @extends KISSY.Event.BaseCustomEvent
     * @private
     */
    function CustomEvent() {
        var self = this;
        CustomEvent.superclass.constructor.apply(self, arguments);
        self.defaultFn = null;
        self.defaultTargetOnly = false;
        /**
         * event target which binds current custom event
         * @cfg {KISSY.Event.Target} currentTarget
         */
    }

    S.extend(CustomEvent, Event._BaseCustomEvent, {

        constructor: CustomEvent,

        /**
         * add a subscriber to custom event's subscribers
         * @param {Object} cfg {@link KISSY.Event.CustomSubscriber} 's config
         */
        on: function (cfg) {
            var subscriber = new CustomSubscriber(cfg);
            if (this.findSubscriber(subscriber) == -1) {
                this.subscribers.push(subscriber);
            }
        },

        /**
         * notify current custom event 's subscribers and then bubble up if this event can bubble.
         * @param {KISSY.Event.CustomEventObject} eventData
         * @return {*} return false if one of custom event 's subscribers (include bubbled) else
         * return last value of custom event 's subscribers (include bubbled) 's return value.
         */
        fire: function (eventData) {

            if (!this.hasSubscriber() && !this.bubbles) {
                return;
            }

            eventData = eventData || {};

            var self = this,
                type = self.type,
                defaultFn = self.defaultFn,
                i,
                parents,
                len,
                currentTarget = self.currentTarget,
                customEvent = eventData,
                gRet, ret;

            eventData.type = type;

            if (!(customEvent instanceof  CustomEventObject)) {
                customEvent.target = currentTarget;
                customEvent = new CustomEventObject(customEvent);
            }

            customEvent.currentTarget = currentTarget;

            gRet = ret = self.notify(customEvent);

            if (self.bubbles) {
                parents = currentTarget.getTargets();
                len = parents && parents.length || 0;

                for (i = 0; i < len && !customEvent.isPropagationStopped(); i++) {

                    ret = parents[i].fire(type, customEvent);

                    // false 优先返回
                    if (gRet !== false) {
                        gRet = ret;
                    }

                }
            }

            if (defaultFn && !customEvent.isDefaultPrevented()) {
                var lowestCustomEvent = customEvent.target.__getCustomEvent(customEvent.type);
                if ((!self.defaultTargetOnly && !lowestCustomEvent.defaultTargetOnly) ||
                    self == customEvent.target) {
                    defaultFn.call(self);
                }
            }

            return gRet;

        },

        /**
         * notify current event 's subscribers
         * @param {KISSY.Event.CustomEventObject} event
         * @return {*} return false if one of custom event 's subscribers  else
         * return last value of custom event 's subscribers 's return value.
         */
        notify: function (event) {
            var subscribers = this.subscribers,
                ret,
                gRet,
                len = subscribers.length, i;

            for (i = 0; i < len && !event.isImmediatePropagationStopped(); i++) {
                ret = subscribers[i].notify(event, this);
                if (gRet !== false) {
                    gRet = ret;
                }
                if (ret === false) {
                    event.halt();
                }
            }

            return gRet;
        },

        /**
         * remove some subscribers from current event 's subscribers by subscriber config param
         * @param {Object} cfg {@link KISSY.Event.CustomSubscriber} 's config
         */
        detach: function (cfg) {
            var groupsRe,
                self = this,
                fn = cfg.fn,
                context = self.context,
                currentTarget = self.currentTarget,
                subscribers = self.subscribers,
                groups = cfg.groups;

            if (!subscribers.length) {
                return;
            }

            if (groups) {
                groupsRe = _Utils.getGroupsRe(groups);
            }

            var i, j, t, subscriber, subscriberContext, len = subscribers.length;

            // 移除 fn
            if (fn || groupsRe) {
                context = context || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    subscriber = subscribers[i];
                    subscriberContext = subscriber.context || currentTarget;
                    if (
                        (context != subscriberContext) ||
                            // 指定了函数，函数不相等，保留
                            (fn && fn != subscriber.fn) ||
                            // 指定了删除的某些组，而该 subscriber 不属于这些组，保留，否则删除
                            (groupsRe && !subscriber.groups.match(groupsRe))
                        ) {
                        t[j++] = subscriber;
                    }
                }

                self.subscribers = t;
            } else {
                // 全部删除
                self.reset();
            }
        }
    });

    return CustomEvent;

}, {
    requires: ['./subscriber', './object', 'event/base']
});