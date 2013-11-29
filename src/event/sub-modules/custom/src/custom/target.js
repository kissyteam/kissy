/**
 * @ignore
 * custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var BaseEvent = require('event/base');
    var CustomEventObservable = require('./observable');

    var Utils = BaseEvent.Utils,
        splitAndRun = Utils.splitAndRun,
        KS_BUBBLE_TARGETS = '__~ks_bubble_targets';

    /**
     * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
     * and also allows other EventTargets to target the object with events sourced from the other object.
     *
     * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
     *
     * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
     * or will not be created at all.
     *
     *
     *
     *      @example
     *      KISSY.use('event',function(S,Event){
     *          var target = S.mix({}, Event.Target);
     *          target.on('ok',function(){
     *              document.writeln('ok fired @'+new Date());
     *          });
     *          target.fire('ok');
     *      });
     *
     *
     * @class KISSY.Event.CustomEvent.Target
     */

    var KS_CUSTOM_EVENTS = '__~ks_custom_events';

    return {
        isTarget: 1,

        /**
         * Get custom event for specified event
         * @private
         * @param {String} type event type
         * @param {Boolean} [create] whether create custom event on fly
         * @return {KISSY.Event.CustomEvent.CustomEventObservable}
         */
        getCustomEventObservable: function (type, create) {
            var target = this,
                customEvent,
                customEventObservables = target.getCustomEvents();
            customEvent = customEventObservables && customEventObservables[type];
            if (!customEvent && create) {
                customEvent = customEventObservables[type] = new CustomEventObservable({
                    currentTarget: target,
                    type: type
                });
            }
            return customEvent;
        },

        /**
         * Fire a custom event by name.
         * The callback functions will be executed from the context specified when the event was created,
         * and the {@link KISSY.Event.CustomEvent.Object} created will be mixed with eventData
         * @method fire
         * @param {String} type The type of the event
         * @param {Object} [eventData] The data will be mixed with {@link KISSY.Event.CustomEvent.Object} created
         * @return {*} If any listen returns false, then the returned value is false. else return the last listener's returned value
         */
        fire: function (type, eventData) {
            var self = this,
                ret,
                targets = self.getTargets(),
                hasTargets = targets && targets.length;

            eventData = eventData || {};

            splitAndRun(type, function (type) {

                var r2, customEventObservable;

                Utils.fillGroupsForEvent(type, eventData);

                type = eventData.type;

                // default bubble true
                // if bubble false, it must has customEvent structure set already
                customEventObservable = self.getCustomEventObservable(type);

                // optimize performance for empty event listener
                if (!customEventObservable && !hasTargets) {
                    return;
                }

                if (customEventObservable) {

                    if (!customEventObservable.hasObserver() && !customEventObservable.defaultFn) {

                        if (customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles) {
                            return;
                        }

                    }

                } else {
                    // in case no publish custom event but we need bubble
                    // because bubbles defaults to true!
                    customEventObservable = new CustomEventObservable({
                        currentTarget: self,
                        type: type
                    });
                }

                r2 = customEventObservable.fire(eventData);

                if (ret !== false && r2 !== undefined) {
                    ret = r2;
                }

            });

            return ret;
        },

        /**
         * Creates a new custom event of the specified type
         * @method publish
         * @param {String} type The type of the event
         * @param {Object} cfg Config params
         * @param {Boolean} [cfg.bubbles=true] whether or not this event bubbles
         * @param {Function} [cfg.defaultFn] this event's default action
         * @chainable
         */
        publish: function (type, cfg) {
            var customEventObservable,
                self = this;

            splitAndRun(type, function (t) {
                customEventObservable = self.getCustomEventObservable(t, true);
                S.mix(customEventObservable, cfg);
            });

            return self;
        },

        /**
         * Registers another EventTarget as a bubble target.
         * @method addTarget
         * @param {KISSY.Event.CustomEvent.Target} anotherTarget Another EventTarget instance to add
         * @chainable
         */
        addTarget: function (anotherTarget) {
            var self = this,
                targets = self.getTargets();
            if (!S.inArray(anotherTarget, targets)) {
                targets.push(anotherTarget);
            }
            return self;
        },

        /**
         * Removes a bubble target
         * @method removeTarget
         * @param {KISSY.Event.CustomEvent.Target} anotherTarget Another EventTarget instance to remove
         * @chainable
         */
        removeTarget: function (anotherTarget) {
            var self = this,
                targets = self.getTargets(),
                index = S.indexOf(anotherTarget, targets);
            if (index !== -1) {
                targets.splice(index, 1);
            }
            return self;
        },

        /**
         * all targets where current target's events bubble to
         * @private
         * @return {KISSY.Event.CustomEvent.Target[]}
         */
        getTargets: function () {
            return this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = []);
        },

        getCustomEvents: function () {
            return this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {});
        },

        /**
         * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
         * @method on
         * @param {String} type The name of the event
         * @param {Function} fn The callback to execute in response to the event
         * @param {Object} [context] this object in callback
         * @chainable
         */
        on: function (type, fn, context) {
            var self = this;
            Utils.batchForType(function (type, fn, context) {
                var cfg = Utils.normalizeParam(type, fn, context),
                    customEvent;
                type = cfg.type;
                customEvent = self.getCustomEventObservable(type, true);
                if (customEvent) {
                    customEvent.on(cfg);
                }
            }, 0, type, fn, context);
            return self; // chain
        },

        /**
         * Detach one or more listeners from the specified event
         * @method detach
         * @param {String} type The name of the event
         * @param {Function} [fn] The subscribed function to un-subscribe. if not supplied, all observers will be removed.
         * @param {Object} [context] The custom object passed to subscribe.
         * @chainable
         */
        detach: function (type, fn, context) {
            var self = this;
            Utils.batchForType(function (type, fn, context) {
                var cfg = Utils.normalizeParam(type, fn, context),
                    customEvents,
                    customEvent;
                type = cfg.type;
                if (type) {
                    customEvent = self.getCustomEventObservable(type, true);
                    if (customEvent) {
                        customEvent.detach(cfg);
                    }
                } else {
                    customEvents = self.getCustomEvents();
                    S.each(customEvents, function (customEvent) {
                        customEvent.detach(cfg);
                    });
                }
            }, 0, type, fn, context);

            return self; // chain
        }
    };
});
/*
 yiminghe: 2012-10-24
 - implement defaultFn for custom event

 yiminghe: 2011-10-17
 - implement bubble for custom event
 */