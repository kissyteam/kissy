/**
 * @ignore
 * setup event/dom api module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/api', function (S, Event, DOM, special, Utils, ObservableDOMEvent, DOMEventObject) {
    var _Utils = Event._Utils;

    function fixType(cfg, type) {
        var s = special[type] || {};
        // in case overwritten by delegateFix/onFix in special events
        // (mouseenter/leave,focusin/out)

        if (!cfg.originalType) {
            if (cfg.selector) {
                if (s['delegateFix']) {
                    cfg.originalType = type;
                    type = s['delegateFix'];
                }
            } else {
                // when on mouseenter, it's actually on mouseover,
                // and observers is saved with mouseover!
                // TODO need evaluate!
                if (s['onFix']) {
                    cfg.originalType = type;
                    type = s['onFix'];
                }
            }
        }

        return type;
    }

    function addInternal(currentTarget, type, cfg) {
        var eventDesc,
            customEvent,
            events,
            handle;

        cfg = S.merge(cfg);
        type = fixType(cfg, type);

        // 获取事件描述
        eventDesc = ObservableDOMEvent.getCustomEvents(currentTarget, 1);

        if (!(handle = eventDesc.handle)) {
            handle = eventDesc.handle = function (event) {
                // 是经过 fire 手动调用而浏览器同步触发导致的，就不要再次触发了，
                // 已经在 fire 中 bubble 过一次了
                // in case after page has unloaded
                var type = event.type,
                    customEvent,
                    currentTarget = handle.currentTarget;
                if (ObservableDOMEvent.triggeredEvent == type ||
                    typeof KISSY == 'undefined') {
                    return;
                }
                customEvent = ObservableDOMEvent.getCustomEvent(currentTarget, type);
                if (customEvent) {
                    event.currentTarget = currentTarget;
                    event = new DOMEventObject(event);
                    return customEvent.notify(event);
                }
            };
            handle.currentTarget = currentTarget;
        }

        if (!(events = eventDesc.events)) {
            events = eventDesc.events = {};
        }

        //事件 listeners , similar to eventListeners in DOM3 Events
        customEvent = events[type];

        if (!customEvent) {
            customEvent = events[type] = new ObservableDOMEvent({
                type: type,
                fn: handle,
                currentTarget: currentTarget
            });

            customEvent.setup();
        }

        customEvent.on(cfg);

        currentTarget = null;
    }

    function removeInternal(currentTarget, type, cfg) {
        // copy
        cfg = S.merge(cfg);

        var customEvent;

        type = fixType(cfg, type);

        var eventDesc = ObservableDOMEvent.getCustomEvents(currentTarget),
            events = (eventDesc || {}).events;

        if (!eventDesc || !events) {
            return;
        }

        // remove all types of event
        if (!type) {
            for (type in events) {
                events[type].detach(cfg);
            }
            return;
        }

        customEvent = events[type];

        if (customEvent) {
            customEvent.detach(cfg);
        }
    }

    S.mix(Event, {
        /**
         * Adds an event listener.similar to addEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param type {String} The type of event to append.
         * use space to separate multiple event types.
         * @param fn {Function|Object} The event listener or event description object.
         * @param {Function} fn.fn The event listener
         * @param {Function} fn.context The context (this reference) in which the handler function is executed.
         * @param {String|Function} fn.selector filter selector string or function to find right element
         * @param {Boolean} fn.once whether fn will be removed once after it is executed.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         */
        add: function (targets, type, fn, context) {
            type = S.trim(type);
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
            targets = DOM.query(targets);

            _Utils.batchForType(function (targets, type, fn, context) {
                var cfg = _Utils.normalizeParam(type, fn, context), i;
                type = cfg.type;
                for (i = targets.length - 1; i >= 0; i--) {
                    addInternal(targets[i], type, cfg);
                }
            }, 1, targets, type, fn, context);

            return targets;
        },

        /**
         * Detach an event or set of events from an element. similar to removeEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param {String} [type] The type of event to remove.
         * use space to separate multiple event types.
         * @param [fn] {Function|Object} The event listener or event description object.
         * @param {Function} fn.fn The event listener
         * @param {Function} [fn.context] The context (this reference) in which the handler function is executed.
         * @param {String|Function} [fn.selector] filter selector string or function to find right element
         * @param {Boolean} [fn.once] whether fn will be removed once after it is executed.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         */
        remove: function (targets, type, fn, context) {

            type = S.trim(type);

            targets = DOM.query(targets);

            _Utils.batchForType(function (targets, type, fn, context) {
                var cfg = _Utils.normalizeParam(type, fn, context), i;

                type = cfg.type;

                for (i = targets.length - 1; i >= 0; i--) {
                    removeInternal(targets[i], type, cfg);
                }
            }, 1, targets, type, fn, context);


            return targets;

        },

        /**
         * Delegate event.
         * @param targets KISSY selector
         * @param {String|Function} selector filter selector string or function to find right element
         * @param {String} [eventType] The type of event to delegate.
         * use space to separate multiple event types.
         * @param {Function} [fn] The event listener.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        delegate: function (targets, eventType, selector, fn, context) {
            return Event.add(targets, eventType, {
                fn: fn,
                context: context,
                selector: selector
            });
        },
        /**
         * undelegate event.
         * @param targets KISSY selector
         * @param {String} [eventType] The type of event to undelegate.
         * use space to separate multiple event types.
         * @param {String|Function} [selector] filter selector string or function to find right element
         * @param {Function} [fn] The event listener.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        undelegate: function (targets, eventType, selector, fn, context) {
            return Event.remove(targets, eventType, {
                fn: fn,
                context: context,
                selector: selector
            });
        },

        /**
         * fire event,simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @param targets html nodes
         * @member KISSY.Event
         * @param {String} eventType event type
         * @param [eventData] additional event data
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fire: function (targets, eventType, eventData, onlyHandlers/*internal usage*/) {
            var ret = undefined;
            // custom event firing moved to target.js
            eventData = eventData || {};

            /**
             * identify event as fired manually
             * @ignore
             */
            eventData.synthetic = 1;

            _Utils.splitAndRun(eventType, function (eventType) {
                // protect event type
                eventData.type = eventType;

                var r,
                    i,
                    target,
                    customEvent,
                    typedGroups = _Utils.getTypedGroups(eventType),
                    _ks_groups = typedGroups[1];

                if (_ks_groups) {
                    _ks_groups = _Utils.getGroupsRe(_ks_groups);
                }

                eventType = typedGroups[0];

                S.mix(eventData, {
                    type: eventType,
                    _ks_groups: _ks_groups
                });

                targets = DOM.query(targets);

                for (i = targets.length - 1; i >= 0; i--) {
                    target = targets[i];
                    customEvent = ObservableDOMEvent
                        .getCustomEvent(target, eventType);
                    // bubbling
                    // html dom event defaults to bubble
                    if (!onlyHandlers && !customEvent) {
                        customEvent = new ObservableDOMEvent({
                            type: eventType,
                            currentTarget: target
                        });
                    }
                    if (customEvent) {
                        r = customEvent.fire(eventData, onlyHandlers);
                        if (ret !== false) {
                            ret = r;
                        }
                    }
                }
            });

            return ret;
        },

        /**
         * same with fire but:
         * - does not cause default behavior to occur.
         * - does not bubble up the DOM hierarchy.
         * @param targets html nodes
         * @member KISSY.Event
         * @param {String} eventType event type
         * @param [eventData] additional event data
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fireHandler: function (targets, eventType, eventData) {
            return Event.fire(targets, eventType, eventData, 1);
        },


        /**
         * copy event from src to dest
         * @member KISSY.Event
         * @param {HTMLElement} src srcElement
         * @param {HTMLElement} dest destElement
         * @private
         */
        _clone: function (src, dest) {
            var eventDesc, events;
            if (!(eventDesc = ObservableDOMEvent.getCustomEvents(src))) {
                return;
            }
            events = eventDesc.events;
            S.each(events, function (customEvent, type) {
                S.each(customEvent.observers, function (observer) {
                    // scope undefined
                    // 不能 this 写死在 handlers 中
                    // 否则不能保证 clone 时的 this
                    addInternal(dest, type, observer);
                });
            });
        },

        _ObservableDOMEvent: ObservableDOMEvent
    });

    /**
     * Same with {@link KISSY.Event#add}
     * @method
     * @member KISSY.Event
     */
    Event.on = Event.add;
    /**
     * Same with {@link KISSY.Event#remove}
     * @method
     * @member KISSY.Event
     */
    Event.detach = Event.remove;

    return Event;
}, {
    requires: ['event/base', 'dom', './special', './utils', './observable', './object']
});
/*
 2012-02-12 yiminghe@gmail.com note:
 - 普通 remove() 不管 selector 都会查，如果 fn context 相等就移除
 - undelegate() selector 为 ''，那么去除所有委托绑定的 handler
 */
