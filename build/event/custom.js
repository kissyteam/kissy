/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 25 00:37
*/
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
});/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Event, Target) {
    S.EventTarget = Event.Target = Target;
    return {
        Target: Target
    };
}, {
    requires: ['./base', './custom/target']
});/**
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
});/**
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
});/**
 * @ignore
 * @fileOverview custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/target', function (S, Event, CustomEvent) {
    var KS_CUSTOM_EVENTS = '__~ks_custom_events',
        trim = S.trim,
        _Utils = Event._Utils,
        splitAndRun = _Utils.splitAndRun,
        KS_BUBBLE_TARGETS = '__~ks_bubble_targets';

    /**
     * @class KISSY.Event.Target
     * @singleton
     * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
     * and also allows other EventTargets to target the object with events sourced from the other object.
     * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
     * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
     * or will not be created at all.
     */
    var Target = {

        __getCustomEvent: function (t, create) {
            var self = this,
                customEvent,
                customEvents = self[KS_CUSTOM_EVENTS];
            customEvent = customEvents && customEvents[t];
            if (!customEvent && create) {
                customEvents = self[KS_CUSTOM_EVENTS] = customEvents || {};
                customEvent = customEvents[t] = new CustomEvent({
                    currentTarget: self,
                    type: t
                });
            }
            return customEvent;
        },

        /**
         * Fire a custom event by name.
         * The callback functions will be executed from the context specified when the event was created,
         * and the {@link KISSY.Event.Object} created will be mixed with eventData
         * @param {String} type The type of the event
         * @param {Object} [eventData] The data will be mixed with {@link KISSY.Event.Object} created
         * @return {*} If any listen returns false, then the returned value is false. else return the last listener's returned value
         */
        fire: function (type, eventData) {
            var self = this, ret = undefined;

            eventData = eventData || {};

            splitAndRun(type, function (type) {
                var r2, customEvent,
                    typedGroups = _Utils.getTypedGroups(type),
                    _ks_groups = typedGroups[1];

                type = typedGroups[0];

                if (_ks_groups) {
                    _ks_groups = _Utils.getGroupsRe(_ks_groups);
                    eventData._ks_groups = _ks_groups;
                }

                customEvent = self.__getCustomEvent(type);

                if (customEvent) {
                    r2 = customEvent.fire(eventData);
                }

                if (ret !== false) {
                    ret = r2;
                }
            });

            return ret;
        },

        /**
         * Creates a new custom event of the specified type
         * @param {String} type The type of the event
         * @param {Object} cfg Config params
         * @param {Boolean} [cfg.bubbles=false] whether or not this event bubbles
         */
        publish: function (type, cfg) {
            var self = this, customEvent;

            splitAndRun(type, function (t) {
                customEvent = self.__getCustomEvent(t, 1);
                S.mix(customEvent, cfg)
            });
        },

        /**
         * Registers another EventTarget as a bubble target.
         * @param {KISSY.Event.Target} target Another EventTarget instance to add
         */
        addTarget: function (target) {
            var self = this,
                targets = self.getTargets();
            if (!S.inArray(target, targets)) {
                targets.push(target);
            }
        },

        /**
         * Removes a bubble target
         * @param {KISSY.Event.Target} target Another EventTarget instance to remove
         */
        removeTarget: function (target) {
            var self = this,
                targets = self.getTargets(),
                index = S.indexOf(target, targets);
            if (index != -1) {
                targets.splice(index, 1);
            }
        },

        getTargets: function () {
            self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || [];
            return self[KS_BUBBLE_TARGETS];
        },

        /**
         * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
         * @method
         * @param {String} type The name of the event
         * @param {Function} fn The callback to execute in response to the event
         * @param {Object} [context] this object in callback
         */
        on: function (type, fn, context) {
            var self = this;
            type = trim(type);
            _Utils.batchForType(function (type, fn, context) {
                var cfg = _Utils.normalizeParam(type, fn, context),
                    customEvent;
                type = cfg.type;
                customEvent = self.__getCustomEvent(type, 1);
                if (customEvent) {
                    customEvent.on(cfg);
                }
            }, 0, type, fn, context);

            return self; // chain
        },

        /**
         * Detach one or more listeners the from the specified event
         * @method
         * @param {String} type The name of the event
         * @param {Function} [fn] The subscribed function to un-subscribe. if not supplied, all subscribers will be removed.
         * @param {Object} [context] The custom object passed to subscribe.
         */
        detach: function (type, fn, context) {
            var self = this;
            type = trim(type);
            _Utils.batchForType(function (type, fn, context) {
                var cfg = _Utils.normalizeParam(type, fn, context),
                    customEvent;
                type = cfg.type;
                if (!type) {
                    var customEvents = self[KS_CUSTOM_EVENTS] || {};
                    S.each(customEvents, function (customEvent) {
                        customEvent.detach(cfg);
                    });
                } else {
                    customEvent = self.__getCustomEvent(type, 1);
                    if (customEvent) {
                        customEvent.detach(cfg);
                    }
                }
            }, 0, type, fn, context);

            return self; // chain
        }
    };

    return Target;
}, {
    requires: ['event/base', './custom-event']
});
/*
 yiminghe: 2012-10-24
 - implement defaultFn for custom event

 yiminghe: 2011-10-17
 - implement bubble for custom event
 */
