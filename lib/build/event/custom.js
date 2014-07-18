/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:01
*/
/*
combined modules:
event/custom
event/custom/target
event/custom/observable
event/custom/observer
event/custom/object
*/
KISSY.add('event/custom', [
    './custom/target',
    'util',
    './custom/object'
], function (S, require, exports, module) {
    /**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
    var Target = require('./custom/target');
    var util = require('util');
    module.exports = {
        Target: Target,
        Object: require('./custom/object'),
        /**
     * global event target
     * @property {KISSY.Event.CustomEvent.Target} global
     * @member KISSY.Event.CustomEvent
     */
        global: util.mix({}, Target)
    };
});
KISSY.add('event/custom/target', [
    'event/base',
    './observable',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */
    var BaseEvent = require('event/base');
    var CustomEventObservable = require('./observable');
    var util = require('util');
    var Utils = BaseEvent.Utils, splitAndRun = Utils.splitAndRun, KS_BUBBLE_TARGETS = '__~ks_bubble_targets';    /**
 * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
 * and also allows other EventTargets to target the object with events sourced from the other object.
 *
 * EventTarget is designed to be used with augment to allow events to be listened to and fired by name.
 *
 * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
 * or will not be created at all.
 *
 *
 *
 *      @example
 *      KISSY.use('event/custom',function(S,CustomEvent){
     *          var target = mix({}, CustomEvent.Target);
     *          target.on('ok',function(){
     *              document.writeln('ok fired @'+new Date());
 *          });
 *          target.fire('ok');
 *      });
 *
 *
 * @class KISSY.Event.CustomEvent.Target
 */
    /**
 * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
 * and also allows other EventTargets to target the object with events sourced from the other object.
 *
 * EventTarget is designed to be used with augment to allow events to be listened to and fired by name.
 *
 * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
 * or will not be created at all.
 *
 *
 *
 *      @example
 *      KISSY.use('event/custom',function(S,CustomEvent){
     *          var target = mix({}, CustomEvent.Target);
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
    function getCustomEventObservable(self, type) {
        var customEvent = self.getEventListeners(type);
        if (!customEvent) {
            customEvent = self.getEventListeners()[type] = new CustomEventObservable({
                currentTarget: self,
                type: type
            });
        }
        return customEvent;
    }
    module.exports = {
        isTarget: 1,
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
            var self = this, ret, targets = self.getTargets(), hasTargets = targets && targets.length;
            if (type.isEventObject) {
                eventData = type;
                type = type.type;
            }
            eventData = eventData || {};
            splitAndRun(type, function (type) {
                var r2, customEventObservable;
                Utils.fillGroupsForEvent(type, eventData);
                type = eventData.type;    // default bubble true
                                          // if bubble false, it must has customEvent structure set already
                // default bubble true
                // if bubble false, it must has customEvent structure set already
                customEventObservable = self.getEventListeners(type);    // optimize performance for empty event listener
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
            var customEventObservable, self = this;
            splitAndRun(type, function (t) {
                customEventObservable = getCustomEventObservable(self, t);
                util.mix(customEventObservable, cfg);
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
            var self = this, targets = self.getTargets();
            if (!util.inArray(anotherTarget, targets)) {
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
            var self = this, targets = self.getTargets(), index = util.indexOf(anotherTarget, targets);
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
        getEventListeners: function (type) {
            var observables = this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {});
            return type ? observables[type] : observables;
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
                var cfg = Utils.normalizeParam(type, fn, context);
                type = cfg.type;
                var customEvent = getCustomEventObservable(self, type);
                customEvent.on(cfg);
            }, 0, type, fn, context);
            return self;    // chain
        },
        // chain
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
                var cfg = Utils.normalizeParam(type, fn, context);
                type = cfg.type;
                if (type) {
                    var customEvent = self.getEventListeners(type);
                    if (customEvent) {
                        customEvent.detach(cfg);
                    }
                } else {
                    util.each(self.getEventListeners(), function (customEvent) {
                        customEvent.detach(cfg);
                    });
                }
            }, 0, type, fn, context);
            return self;    // chain
        }
    };    /*
 yiminghe: 2012-10-24
 - implement defaultFn for custom event

 yiminghe: 2011-10-17
 - implement bubble for custom event
 */
});

KISSY.add('event/custom/observable', [
    'event/base',
    './observer',
    './object',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * custom event mechanism for kissy.
 * refer: http://www.w3.org/TR/domcore/#interface-customevent
 * @author yiminghe@gmail.com
 */
    var BaseEvent = require('event/base');
    var CustomEventObserver = require('./observer');
    var CustomEventObject = require('./object');
    var Utils = BaseEvent.Utils;
    var util = require('util');    /**
 * custom event for registering and un-registering observer for specified event on normal object.
 * @class KISSY.Event.CustomEvent.CustomEventObservable
 * @extends KISSY.Event.Observable
 * @private
 */
    /**
 * custom event for registering and un-registering observer for specified event on normal object.
 * @class KISSY.Event.CustomEvent.CustomEventObservable
 * @extends KISSY.Event.Observable
 * @private
 */
    function CustomEventObservable() {
        var self = this;
        CustomEventObservable.superclass.constructor.apply(self, arguments);
        self.defaultFn = null;
        self.defaultTargetOnly = false;    /**
     * whether this event can bubble.
     * Defaults to: true
     * @cfg {Boolean} bubbles
     */
        /**
     * whether this event can bubble.
     * Defaults to: true
     * @cfg {Boolean} bubbles
     */
        self.bubbles = true;    /**
     * event target which binds current custom event
     * @cfg {KISSY.Event.CustomEvent.Target} currentTarget
     */
    }
    /**
     * event target which binds current custom event
     * @cfg {KISSY.Event.CustomEvent.Target} currentTarget
     */
    util.extend(CustomEventObservable, BaseEvent.Observable, {
        /**
     * add a observer to custom event's observers
     * @param {Object} cfg {@link KISSY.Event.CustomEvent.Observer} 's config
     */
        on: function (cfg) {
            var observer = /**@ignore
         @type KISSY.Event.CustomEvent.Observer*/
                new CustomEventObserver(cfg);
            if (this.findObserver(observer) === -1) {
                this.observers.push(observer);
            }
        },
        /**
     * notify current custom event 's observers and then bubble up if this event can bubble.
     * @param {KISSY.Event.CustomEvent.Object} eventData
     * @return {*} return false if one of custom event 's observers (include bubbled) else
     * return last value of custom event 's observers (include bubbled) 's return value.
     */
        fire: function (eventData) {
            eventData = eventData || {};
            var self = this, bubbles = self.bubbles, currentTarget = self.currentTarget, parents, parentsLen, type = self.type, defaultFn = self.defaultFn, i, customEventObject = eventData, gRet, ret;
            eventData.type = type;
            if (!customEventObject.isEventObject) {
                customEventObject = new CustomEventObject(customEventObject);
            }
            customEventObject.target = customEventObject.target || currentTarget;
            customEventObject.currentTarget = currentTarget;
            ret = self.notify(customEventObject);
            if (gRet !== false && ret !== undefined) {
                gRet = ret;
            }    // gRet === false prevent
            // gRet === false prevent
            if (bubbles && !customEventObject.isPropagationStopped()) {
                parents = currentTarget.getTargets();
                parentsLen = parents && parents.length || 0;
                for (i = 0; i < parentsLen && !customEventObject.isPropagationStopped(); i++) {
                    ret = parents[i].fire(type, customEventObject);    // false 优先返回
                    // false 优先返回
                    if (gRet !== false && ret !== undefined) {
                        gRet = ret;
                    }
                }
            }    // bubble first
                 // parent defaultFn first
                 // child defaultFn last
            // bubble first
            // parent defaultFn first
            // child defaultFn last
            if (defaultFn && !customEventObject.isDefaultPrevented()) {
                var target = customEventObject.target, lowestCustomEventObservable = target.getEventListeners(customEventObject.type);
                if (!self.defaultTargetOnly && // defaults to false
                    (!lowestCustomEventObservable || !lowestCustomEventObservable.defaultTargetOnly) || currentTarget === target) {
                    // default value as final value if possible
                    gRet = defaultFn.call(currentTarget, customEventObject);
                }
            }
            return gRet;
        },
        /**
     * notify current event 's observers
     * @param {KISSY.Event.CustomEvent.Object} event
     * @return {*} return false if one of custom event 's observers  else
     * return last value of custom event 's observers 's return value.
     */
        notify: function (event) {
            // duplicate,in case detach itself in one observer
            var observers = [].concat(this.observers), ret, gRet, len = observers.length, i;
            for (i = 0; i < len && !event.isImmediatePropagationStopped(); i++) {
                ret = observers[i].notify(event, this);
                if (gRet !== false && ret !== undefined) {
                    gRet = ret;
                }
            }
            return gRet;
        },
        /**
     * remove some observers from current event 's observers by observer config param
     * @param {Object} cfg {@link KISSY.Event.CustomEvent.Observer} 's config
     */
        detach: function (cfg) {
            var groupsRe, self = this, fn = cfg.fn, context = cfg.context, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
            if (!observers.length) {
                return;
            }
            if (groups) {
                groupsRe = Utils.getGroupsRe(groups);
            }
            var i, j, t, observer, observerContext, len = observers.length;    // 移除 fn
            // 移除 fn
            if (fn || groupsRe) {
                context = context || currentTarget;
                for (i = 0, j = 0, t = []; i < len; ++i) {
                    observer = observers[i];
                    var observerConfig = observer.config;
                    observerContext = observerConfig.context || currentTarget;
                    if (context !== observerContext || // 指定了函数，函数不相等，保留
                        fn && fn !== observerConfig.fn || // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                        groupsRe && !observerConfig.groups.match(groupsRe)) {
                        t[j++] = observer;
                    }
                }
                self.observers = t;
            } else {
                // 全部删除
                self.reset();
            }    // does not need to clear memory if customEvent has no observer
                 // customEvent has defaultFn .....!
                 // self.checkMemory();
        }
    });
    // does not need to clear memory if customEvent has no observer
    // customEvent has defaultFn .....!
    // self.checkMemory();
    module.exports = CustomEventObservable;    /**
 * @ignore
 * 2012-10-26 yiminghe@gmail.com
 *  - custom event can bubble by default!
 */
});
KISSY.add('event/custom/observer', [
    'event/base',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Observer for custom event
 * @author yiminghe@gmail.com
 */
    var BaseEvent = require('event/base');
    var util = require('util');    /**
 * Observer for custom event
 * @class KISSY.Event.CustomEvent.Observer
 * @extends KISSY.Event.Observer
 * @private
 */
    /**
 * Observer for custom event
 * @class KISSY.Event.CustomEvent.Observer
 * @extends KISSY.Event.Observer
 * @private
 */
    function CustomEventObserver() {
        CustomEventObserver.superclass.constructor.apply(this, arguments);
    }
    util.extend(CustomEventObserver, BaseEvent.Observer, {
        keys: [
            'fn',
            'context',
            'groups'
        ]
    });
    module.exports = CustomEventObserver;
});

KISSY.add('event/custom/object', [
    'event/base',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
    var BaseEvent = require('event/base');
    var util = require('util');    /**
 * Do not new by yourself.
 *
 * Custom event object.
 * @private
 * @class KISSY.Event.CustomEvent.Object
 * @param {Object} data data which will be mixed into custom event instance
 * @extends KISSY.Event.Object
 */
    /**
 * Do not new by yourself.
 *
 * Custom event object.
 * @private
 * @class KISSY.Event.CustomEvent.Object
 * @param {Object} data data which will be mixed into custom event instance
 * @extends KISSY.Event.Object
 */
    function CustomEventObject(data) {
        CustomEventObject.superclass.constructor.call(this);
        util.mix(this, data);    /**
     * source target of current event
     * @property  target
     * @type {KISSY.Event.CustomEvent.Target}
     */
                                 /**
     * current target which processes current event
     * @property currentTarget
     * @type {KISSY.Event.CustomEvent.Target}
     */
    }
    /**
     * source target of current event
     * @property  target
     * @type {KISSY.Event.CustomEvent.Target}
     */
    /**
     * current target which processes current event
     * @property currentTarget
     * @type {KISSY.Event.CustomEvent.Target}
     */
    util.extend(CustomEventObject, BaseEvent.Object);
    module.exports = CustomEventObject;
});
