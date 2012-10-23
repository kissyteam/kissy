/**
 * custom event mechanism for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/custom-event', function (S, CustomSubscriber, CustomEventObject, Event) {

    var _Utils = Event._Utils;

    function CustomEvent() {
        CustomEvent.superclass.constructor.apply(this, arguments);
        this.defaultFn = null;
        this.defaultTargetOnly = false;
    }

    S.extend(CustomEvent, Event._BaseCustomEvent, {
        constructor: CustomEvent,


        on: function (cfg) {
            var subscriber = new CustomSubscriber(cfg);
            if (this.findSubscriber(subscriber) == -1) {
                this.subscribers.push(subscriber);
            }
        },

        fire: function (eventData) {

            eventData = eventData || {};
            eventData.type = this.type;
            var currentTarget = this.currentTarget;
            var customEvent = eventData, gRet, ret;

            if (!(customEvent instanceof  CustomEventObject)) {
                customEvent.target = currentTarget;
                customEvent = new CustomEventObject(customEvent);
            }

            customEvent.currentTarget = currentTarget;

            gRet = ret = this.notify(customEvent);

            if (this.bubbles) {
                var parents = currentTarget.getTargets(),
                    len = parents && parents.length || 0;

                for (var i = 0; i < len && !customEvent.isPropagationStopped(); i++) {

                    ret = parents[i].fire(customEvent);

                    // false 优先返回
                    if (gRet !== false) {
                        gRet = ret;
                    }

                }
            }

            if (this.defaultFn && !customEvent.isDefaultPrevented()) {
                var lowestCustomEvent = customEvent.target.__getCustomEvent(customEvent.type);
                if ((!this.defaultTargetOnly && !lowestCustomEvent.defaultTargetOnly) || this == customEvent.target) {
                    this.defaultFn.call(this);
                }
            }

            return gRet;

        },

        notify: function (event) {
            var subscribers = this.subscribers,
                ret,
                gRet,
                len = subscribers.length, i;

            for (i = 0; i < len && !event.isImmediatePropagationStopped; i++) {
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

        detach: function (cfg) {
            var groupsRe,
                self = this,
                scope = self.scope,
                currentTarget = self.currentTarget,
                subscribers = self.subscribers,
                groups = cfg.groups;

            if (!subscribers.length) {
                return;
            }

            if (groups) {
                groupsRe = _Utils.getGroupsRe(groups);
            }

            var i, j, t, subscriber, subscriberScope, len = subscribers.length;

            // 移除 fn
            if (fn || groupsRe) {
                scope = scope || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    subscriber = subscribers[i];
                    subscriberScope = subscriber.scope || currentTarget;
                    if (
                        (scope != subscriberScope) ||
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