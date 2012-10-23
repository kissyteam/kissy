/**
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

    function attach(method) {
        return function (type, cfg) {
            var self = this;
            type = trim(type);
            splitAndRun(type, function (t) {
                var customEvent = self.__getCustomEvent(t);
                if (customEvent) {
                    customEvent[method](cfg);
                }
            });
            return self; // chain
        };
    }

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

        __getCustomEvent: function (t) {
            var self = this,
                customEvents = self[KS_CUSTOM_EVENTS];
            return customEvents && customEvents[t];
        },

        /**
         * Fire a custom event by name.
         * The callback functions will be executed from the context specified when the event was created,
         * and the {@link KISSY.Event.Object} created will be mixed with eventData
         * @param {String} type The type of the event
         * @param {Object} [eventData] The data will be mixed with {@link KISSY.Event.Object} created
         * @return {Boolean|*} If any listen returns false, then the returned value is false. else return the last listener's returned value
         */
        fire: function (type, eventData) {
            var self = this,
                ret = undefined,
                r2,
                typedGroups,
                _ks_groups,
                customEvent;

            eventData = eventData || {};

            type = trim(type);

            if (type.indexOf(' ') > 0) {
                splitAndRun(type, function (t) {
                    r2 = self.fire(t, eventData);
                    if (ret !== false) {
                        ret = r2;
                    }
                });
                return ret;
            }

            typedGroups = _Utils.getTypedGroups(type);
            _ks_groups = typedGroups[1];

            type = typedGroups[0];

            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }

            S.mix(eventData, {
                // protect type
                type: type,
                _ks_groups: _ks_groups
            });

            customEvent = self.__getCustomEvent(type);

            if (customEvent) {
                ret = customEvent.fire(eventData);
            }

            return ret
        },

        /**
         * Creates a new custom event of the specified type
         * @param {String} type The type of the event
         * @param {Object} cfg Config params
         * @param {Boolean} [cfg.bubbles=false] whether or not this event bubbles
         */
        publish: function (type, cfg) {
            var self = this, customEvents, customEvent;
            customEvents = self[KS_CUSTOM_EVENTS] = self[KS_CUSTOM_EVENTS] || {};

            type = trim(type);
            if (type) {
                splitAndRun(type, function (t) {
                    if (!(customEvent = customEvents[t])) {
                        customEvent = customEvents[t] = new CustomEvent();
                    }
                    S.mix(customEvent, cfg)
                });
            }
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
                targets.splice(index, target);
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
         * @param {Object} [scope] this object in callback
         */
        on: attach('on'),
        /**
         * Detach one or more listeners the from the specified event
         * @method
         * @param {String} type The name of the event
         * @param {Function} [fn] The subscribed function to un-subscribe. if not supplied, all subscribers will be removed.
         * @param {Object} [scope] The custom object passed to subscribe.
         */
        detach: attach('detach')
    };

    return Target;
}, {
    requires: ['event/base', './custom-event']
});
/*
 yiminghe: 2011-10-17
 - implement bubble for custom event
 */