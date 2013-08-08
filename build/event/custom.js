﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 7 12:57
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/custom/observer
 event/custom/object
 event/custom/observable
 event/custom/target
 event/custom
*/

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
/**
 * @ignore
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/object', function (S, BaseEvent) {

    /**
     * Do not new by yourself.
     *
     * Custom event object.
     * @class KISSY.Event.CustomEventObject
     * @param {Object} data data which will be mixed into custom event instance
     * @extends KISSY.Event.Object
     */
    function CustomEventObject(data) {
        CustomEventObject.superclass.constructor.call(this);
        S.mix(this, data);
        /**
         * source target of current event
         * @property  target
         * @type {KISSY.Event.Target}
         */
        /**
         * current target which processes current event
         * @property currentTarget
         * @type {KISSY.Event.Target}
         */
    }

    S.extend(CustomEventObject, BaseEvent.Object);

    return CustomEventObject;

}, {
    requires: ['event/base']
});
/**
 * @ignore
 * custom event mechanism for kissy.
 * refer: http://www.w3.org/TR/domcore/#interface-customevent
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/observable', function (S, CustomEventObserver, CustomEventObject, BaseEvent) {

    var Utils = BaseEvent.Utils;

    /**
     * custom event for registering and un-registering observer for specified event on normal object.
     * @class KISSY.Event.CustomEventObservable
     * @extends KISSY.Event.Observable
     * @private
     */
    function CustomEventObservable() {
        var self = this;
        CustomEventObservable.superclass.constructor.apply(self, arguments);
        self.defaultFn = null;
        self.defaultTargetOnly = false;

        /**
         * whether this event can bubble.
         * Defaults to: true
         * @cfg {Boolean} bubbles
         */
        self.bubbles = true;
        /**
         * event target which binds current custom event
         * @cfg {KISSY.Event.Target} currentTarget
         */
    }

    S.extend(CustomEventObservable, BaseEvent.Observable, {
        /**
         * add a observer to custom event's observers
         * @param {Object} cfg {@link KISSY.Event.CustomEventObserver} 's config
         */
        on: function (cfg) {
            var observer = /**@ignore
             @type KISSY.Event.CustomEventObserver*/new CustomEventObserver(cfg);
            if (S.Config.debug) {
                if (!observer.fn) {
                    S.error('lack event handler for ' + this.type);
                }
            }
            if (this.findObserver(observer) == -1) {
                this.observers.push(observer);
            }
        },

        /**
         * notify current custom event 's observers and then bubble up if this event can bubble.
         * @param {KISSY.Event.CustomEventObject} eventData
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fire: function (eventData) {

            eventData = eventData || {};

            var self = this,
                bubbles = self.bubbles,
                currentTarget = self.currentTarget,
                parents,
                parentsLen,
                type = self.type,
                defaultFn = self.defaultFn,
                i,
                customEventObject = eventData,
                gRet, ret;

            eventData.type = type;

            if (!(customEventObject instanceof  CustomEventObject)) {
                customEventObject.target = currentTarget;
                customEventObject = new CustomEventObject(customEventObject);
            }

            customEventObject.currentTarget = currentTarget;

            ret = self.notify(customEventObject);

            if (gRet !== false) {
                gRet = ret;
            }

            // gRet === false prevent
            if (bubbles && !customEventObject.isPropagationStopped()) {

                parents = currentTarget.getTargets(1);

                parentsLen = parents && parents.length || 0;

                for (i = 0; i < parentsLen && !customEventObject.isPropagationStopped(); i++) {

                    ret = parents[i].fire(type, customEventObject);

                    // false 优先返回
                    if (gRet !== false) {
                        gRet = ret;
                    }

                }
            }

            // bubble first
            // parent defaultFn first
            // child defaultFn last
            if (defaultFn && !customEventObject.isDefaultPrevented()) {
                var lowestCustomEventObservable = CustomEventObservable.getCustomEventObservable(customEventObject.target,
                    customEventObject.type);
                if ((!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly) ||
                    currentTarget == customEventObject.target) {
                    // default value as final value if possible
                    gRet = defaultFn.call(currentTarget, customEventObject);
                }
            }

            return gRet;

        },

        /**
         * notify current event 's observers
         * @param {KISSY.Event.CustomEventObject} event
         * @return {*} return false if one of custom event 's observers  else
         * return last value of custom event 's observers 's return value.
         */
        notify: function (event) {
            // duplicate,in case detach itself in one observer
            var observers = [].concat(this.observers),
                ret,
                gRet,
                len = observers.length,
                i;

            for (i = 0; i < len && !event.isImmediatePropagationStopped(); i++) {
                ret = observers[i].notify(event, this);
                if (gRet !== false) {
                    gRet = ret;
                }
                if (ret === false) {
                    // not immediate stop
                    event.halt();
                }
            }

            return gRet;
        },

        /**
         * remove some observers from current event 's observers by observer config param
         * @param {Object} cfg {@link KISSY.Event.CustomEventObserver} 's config
         */
        detach: function (cfg) {
            var groupsRe,
                self = this,
                fn = cfg.fn,
                context = cfg.context,
                currentTarget = self.currentTarget,
                observers = self.observers,
                groups = cfg.groups;

            if (!observers.length) {
                return;
            }

            if (groups) {
                groupsRe = Utils.getGroupsRe(groups);
            }

            var i, j, t, observer, observerContext, len = observers.length;

            // 移除 fn
            if (fn || groupsRe) {
                context = context || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    observer = observers[i];
                    observerContext = observer.context || currentTarget;
                    if (
                        (context != observerContext) ||
                            // 指定了函数，函数不相等，保留
                            (fn && fn != observer.fn) ||
                            // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                            (groupsRe && !observer.groups.match(groupsRe))
                        ) {
                        t[j++] = observer;
                    }
                }

                self.observers = t;
            } else {
                // 全部删除
                self.reset();
            }

            // does not need to clear memory if customEvent has no observer
            // customEvent has defaultFn .....!
            // self.checkMemory();
        }
    });

    var KS_CUSTOM_EVENTS = '__~ks_custom_events';

    /**
     * Get custom event for specified event
     * @static
     * @protected
     * @member KISSY.Event.CustomEventObservable
     * @param {HTMLElement} target
     * @param {String} type event type
     * @param {Boolean} [create] whether create custom event on fly
     * @return {KISSY.Event.CustomEventObservable}
     */
    CustomEventObservable.getCustomEventObservable = function (target, type, create) {
        var customEvent,
            customEventObservables = CustomEventObservable.getCustomEventObservables(target, create);
        customEvent = customEventObservables && customEventObservables[type];
        if (!customEvent && create) {
            customEvent = customEventObservables[type] = new CustomEventObservable({
                currentTarget: target,
                type: type
            });
        }
        return customEvent;
    };

    /**
     * Get custom events holder
     * @protected
     * @static
     * @param {HTMLElement} target
     * @param {Boolean} [create] whether create custom event container on fly
     * @return {Object}
     */
    CustomEventObservable.getCustomEventObservables = function (target, create) {
        if (!target[KS_CUSTOM_EVENTS] && create) {
            target[KS_CUSTOM_EVENTS] = {};
        }
        return target[KS_CUSTOM_EVENTS];
    };

    return CustomEventObservable;

}, {
    requires: [ './observer', './object', 'event/base']
});
/**
 * @ignore
 * 2012-10-26 yiminghe@gmail.com
 *  - custom event can bubble by default!
 */
/**
 * @ignore
 * custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/target', function (S, BaseEvent, CustomEventObservable) {
    var Utils = BaseEvent.Utils,
        splitAndRun = Utils.splitAndRun,
        KS_BUBBLE_TARGETS = '__~ks_bubble_targets';


    /**
     * @class KISSY.Event.Target
     * @singleton
     * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
     * and also allows other EventTargets to target the object with events sourced from the other object.
     *
     * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
     *
     * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
     * or will not be created at all.
     */
    return {

        isTarget: 1,

        /**
         * @ignore
         */
        fire: function (type, eventData) {
            var self = this,
                ret = undefined,
                targets = self.getTargets(1),
                hasTargets = targets && targets.length;

            eventData = eventData || {};

            splitAndRun(type, function (type) {

                var r2, customEventObservable;

                Utils.fillGroupsForEvent(type, eventData);

                type = eventData.type;

                // default bubble true
                // if bubble false, it must has customEvent structure set already
                customEventObservable = CustomEventObservable.getCustomEventObservable(self, type);

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

                if (ret !== false) {
                    ret = r2;
                }

            });

            return ret;
        },

        /**
         * @ignore
         */
        publish: function (type, cfg) {
            var customEventObservable,
                self = this;

            splitAndRun(type, function (t) {
                customEventObservable = CustomEventObservable.getCustomEventObservable(self, t, 1);
                S.mix(customEventObservable, cfg)
            });

            return self;
        },

        /**
         * @ignore
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
         * @ignore
         */
        removeTarget: function (anotherTarget) {
            var self = this,
                targets = self.getTargets(),
                index = S.indexOf(anotherTarget, targets);
            if (index != -1) {
                targets.splice(index, 1);
            }
            return self;
        },

        /**
         * @ignore
         */
        getTargets: function (readOnly) {
            var self = this;
            if (!readOnly) {
                self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || [];
            }
            return self[KS_BUBBLE_TARGETS];
        },

        /**
         * @ignore
         */
        on: function (type, fn, context) {
            var self = this;
            Utils.batchForType(function (type, fn, context) {
                var cfg = Utils.normalizeParam(type, fn, context),
                    customEvent;
                type = cfg.type;
                customEvent = CustomEventObservable.getCustomEventObservable(self, type, 1);
                if (customEvent) {
                    customEvent.on(cfg);
                }
            }, 0, type, fn, context);
            return self; // chain
        },

        /**
         * @ignore
         */
        detach: function (type, fn, context) {
            var self = this;
            Utils.batchForType(function (type, fn, context) {
                var cfg = Utils.normalizeParam(type, fn, context),
                    customEvents,
                    customEvent;
                type = cfg.type;
                if (type) {
                    customEvent = CustomEventObservable.getCustomEventObservable(self, type, 1);
                    if (customEvent) {
                        customEvent.detach(cfg);
                    }
                } else {
                    customEvents = CustomEventObservable.getCustomEventObservables(self);
                    S.each(customEvents, function (customEvent) {
                        customEvent.detach(cfg);
                    });
                }
            }, 0, type, fn, context);

            return self; // chain
        }
    };

    /**
     * Fire a custom event by name.
     * The callback functions will be executed from the context specified when the event was created,
     * and the {@link KISSY.Event.CustomEventObject} created will be mixed with eventData
     * @method fire
     * @param {String} type The type of the event
     * @param {Object} [eventData] The data will be mixed with {@link KISSY.Event.CustomEventObject} created
     * @return {*} If any listen returns false, then the returned value is false. else return the last listener's returned value
     */

    /**
     * Creates a new custom event of the specified type
     * @method publish
     * @param {String} type The type of the event
     * @param {Object} cfg Config params
     * @param {Boolean} [cfg.bubbles=true] whether or not this event bubbles
     * @param {Function} [cfg.defaultFn] this event's default action
     * @chainable
     */

    /**
     * Registers another EventTarget as a bubble target.
     * @method addTarget
     * @param {KISSY.Event.Target} anotherTarget Another EventTarget instance to add
     * @chainable
     */

    /**
     * Removes a bubble target
     * @method removeTarget
     * @param {KISSY.Event.Target} anotherTarget Another EventTarget instance to remove
     * @chainable
     */

    /**
     * all targets where current target's events bubble to
     * @private
     * @method getTargets
     * @return {Array}
     */

    /**
     * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
     * @method on
     * @param {String} type The name of the event
     * @param {Function} fn The callback to execute in response to the event
     * @param {Object} [context] this object in callback
     * @chainable
     */

    /**
     * Detach one or more listeners from the specified event
     * @method detach
     * @param {String} type The name of the event
     * @param {Function} [fn] The subscribed function to un-subscribe. if not supplied, all observers will be removed.
     * @param {Object} [context] The custom object passed to subscribe.
     * @chainable
     */
}, {
    requires: ['event/base', './observable']
});
/*
 yiminghe: 2012-10-24
 - implement defaultFn for custom event

 yiminghe: 2011-10-17
 - implement bubble for custom event
 */
/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Target) {

    return {
        Target: Target
    };

}, {
    requires: ['./custom/target']
});

