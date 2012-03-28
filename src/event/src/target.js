/**
 * @fileOverview 提供事件发布和订阅机制
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/target', function (S, Event, EventObject, Utils, handle, undefined) {
    var KS_PUBLISH = "__~ks_publish",
        trim = S.trim,
        splitAndRun = Utils.splitAndRun,
        KS_BUBBLE_TARGETS = "__~ks_bubble_targets",
        ALL_EVENT = "*";

    function getCustomEvent(self, type, eventData) {
        if (eventData instanceof EventObject) {
            // set currentTarget in the process of bubbling
            eventData.currentTarget = self;
            return eventData;
        }
        var customEvent = new EventObject(self, undefined, type);
        S.mix(customEvent, eventData);
        return customEvent
    }

    function getEventPublishObj(self) {
        self[KS_PUBLISH] = self[KS_PUBLISH] || {};
        return self[KS_PUBLISH];
    }

    function getBubbleTargetsObj(self) {
        self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || {};
        return self[KS_BUBBLE_TARGETS];
    }

    function isBubblable(self, eventType) {
        var publish = getEventPublishObj(self);
        return publish[eventType] && publish[eventType].bubbles || publish[ALL_EVENT] && publish[ALL_EVENT].bubbles
    }

    function attach(method) {
        return function (type, fn, scope) {
            var self = this;
            type = trim(type);
            splitAndRun(type, function (t) {
                Event["__" + method](false, self, t, fn, scope);
            });
            return self; // chain
        };
    }

    /**
     * @class EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
     * and also allows other EventTargets to target the object with events sourced from the other object.
     * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
     * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
     * or will not be created at all.
     * @namespace
     * @name Target
     * @memberOf Event
     */
    var Target =
    /**
     * @lends Event.Target
     */
    {
        /**
         * Fire a custom event by name.
         * The callback functions will be executed from the context specified when the event was created,
         * and the {@link Event.Object} created will be mixed with eventData
         * @param {String} type The type of the event
         * @param {Object} [eventData] The data will be mixed with {@link Event.Object} created
         * @returns {Boolean|*} If any listen returns false, then the returned value is false. else return the last listener's returned value
         */
        fire:function (type, eventData) {
            var self = this,
                ret = undefined,
                r2,
                customEvent;
            eventData = eventData || {};
            type = trim(type);
            if (type.indexOf(" ") > 0) {
                splitAndRun(type, function (t) {
                    r2 = self.fire(t, eventData);
                    if (ret !== false) {
                        ret = r2;
                    }
                });
                return ret;
            }
            var typedGroups = Utils.getTypedGroups(type), _ks_groups = typedGroups[1];
            type = typedGroups[0];
            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }
            S.mix(eventData, {
                // protect type
                type:type,
                _ks_groups:_ks_groups
            });
            customEvent = getCustomEvent(self, type, eventData);
            ret = handle(self, customEvent);
            if (!customEvent.isPropagationStopped &&
                isBubblable(self, type)) {
                r2 = self.bubble(type, customEvent);
                // false 优先返回
                if (ret !== false) {
                    ret = r2;
                }
            }
            return ret
        },

        /**
         * Creates a new custom event of the specified type
         * @param {String} type The type of the event
         * @param {Object} cfg Config params
         * @param {Boolean} [cfg.bubbles=false] whether or not this event bubbles
         */
        publish:function (type, cfg) {
            var self = this,
                publish = getEventPublishObj(self);
            type = trim(type);
            if (type) {
                publish[type] = cfg;
            }
        },

        /**
         * bubble event to its targets
         * @param type
         * @param eventData
         * @private
         */
        bubble:function (type, eventData) {
            var self = this,
                ret = undefined,
                targets = getBubbleTargetsObj(self);
            S.each(targets, function (t) {
                var r2 = t.fire(type, eventData);
                if (ret !== false) {
                    ret = r2;
                }
            });
            return ret;
        },

        /**
         * Registers another EventTarget as a bubble target.
         * @param {Event.Target} target Another EventTarget instance to add
         */
        addTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            targets[S.stamp(target)] = target;
        },

        /**
         * Removes a bubble target
         * @param {Event.Target} target Another EventTarget instance to remove
         */
        removeTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            delete targets[S.stamp(target)];
        },

        /**
         * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
         * @function
         * @param {String} type The name of the event
         * @param {Function} fn The callback to execute in response to the event
         * @param {Object} [scope] this object in callback
         */
        on:attach("add"),
        /**
         * Detach one or more listeners the from the specified event
         * @function
         * @param {String} type The name of the event
         * @param {Function} [fn] The subscribed function to unsubscribe. if not supplied, all subscribers will be removed.
         * @param {Object} [scope] The custom object passed to subscribe.
         */
        detach:attach("remove")
    };

    return Target;
}, {
    requires:["./base", './object', './utils', './handle']
});
/**
 *  yiminghe:2011-10-17
 *   - implement bubble for custom event
 **/