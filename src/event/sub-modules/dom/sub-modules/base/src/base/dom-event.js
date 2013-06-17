/**
 * @ignore
 * setup event/dom api module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/dom-event', function (S, BaseEvent, DOMEventUtils, DOM, Special, ObservableDOMEvent, DOMEventObject) {

    var BaseUtils = BaseEvent.Utils;

    var DOMEvent = {};

    function fixType(cfg, type) {
        var s = Special[type] || {},
            typeFix;

        // in case overwritten by typeFix in special events
        // (mouseenter/leave,focusin/out)
        if (!cfg.originalType && (typeFix = s.typeFix)) {
            // when on mouseenter, it's actually on mouseover,
            // and observers is saved with mouseover!
            cfg.originalType = type;
            type = typeFix;
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
                    return undefined;
                }
                customEvent = ObservableDOMEvent.getCustomEvent(currentTarget, type);
                if (customEvent) {
                    event.currentTarget = currentTarget;
                    event = new DOMEventObject(event);
                    return customEvent.notify(event);
                }
                return undefined;
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

    S.mix(DOMEvent, {
        /**
         * Adds an event listener.similar to addEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param type {String} The type of event to append.
         * use space to separate multiple event types.
         * @param fn {Function|Object} The event listener or event description object.
         * @param {Function} fn.fn The event listener
         * @param {Function} fn.context The context (this reference) in which the handler function is executed.
         * @param {String|Function} fn.filter filter selector string or function to find right element
         * @param {Boolean} fn.once whether fn will be removed once after it is executed.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         */
        on: function (targets, type, fn, context) {
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
            targets = DOM.query(targets);

            BaseUtils.batchForType(function (targets, type, fn, context) {
                var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
                type = cfg.type;
                for (i = targets.length - 1; i >= 0; i--) {
                    t = targets[i];
                    addInternal(t, type, cfg);
                }
            }, 1, targets, type, fn, context);

            return targets;
        },

        /**
         * Detach an event or set of events from an element. similar to removeEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param {String|Boolean} [type] The type of event to remove.
         * use space to separate multiple event types.
         * or
         * whether to remove all events from descendants nodes.
         * @param [fn] {Function|Object} The event listener or event description object.
         * @param {Function} fn.fn The event listener
         * @param {Function} [fn.context] The context (this reference) in which the handler function is executed.
         * @param {String|Function} [fn.filter] filter selector string or function to find right element
         * @param {Boolean} [fn.once] whether fn will be removed once after it is executed.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         */
        detach: function (targets, type, fn, context) {

            targets = DOM.query(targets);

            BaseUtils.batchForType(function (targets, singleType, fn, context) {

                var cfg = BaseUtils.normalizeParam(singleType, fn, context),
                    i,
                    j,
                    elChildren,
                    t;

                singleType = cfg.type;

                for (i = targets.length - 1; i >= 0; i--) {
                    t = targets[i];
                    removeInternal(t, singleType, cfg);
                    // deep remove
                    if (cfg.deep && t.getElementsByTagName) {
                        elChildren = t.getElementsByTagName('*');
                        for (j = elChildren.length - 1; j >= 0; j--) {
                            removeInternal(elChildren[j], singleType, cfg);
                        }
                    }
                }

            }, 1, targets, type, fn, context);

            return targets;

        },

        /**
         * Delegate event.
         * @param targets KISSY selector
         * @param {String|Function} filter filter selector string or function to find right element
         * @param {String} [eventType] The type of event to delegate.
         * use space to separate multiple event types.
         * @param {Function} [fn] The event listener.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        delegate: function (targets, eventType, filter, fn, context) {
            return DOMEvent.on(targets, eventType, {
                fn: fn,
                context: context,
                filter: filter
            });
        },
        /**
         * undelegate event.
         * @param targets KISSY selector
         * @param {String} [eventType] The type of event to undelegate.
         * use space to separate multiple event types.
         * @param {String|Function} [filter] filter selector string or function to find right element
         * @param {Function} [fn] The event listener.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        undelegate: function (targets, eventType, filter, fn, context) {
            return DOMEvent.detach(targets, eventType, {
                fn: fn,
                context: context,
                filter: filter
            });
        },

        /**
         * fire event,simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @param targets html nodes
         * @member KISSY.Event
         * @param {String} eventType event type
         * @param [eventData] additional event data
         * @param {Boolean} [onlyHandlers] for internal usage
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

            BaseUtils.splitAndRun(eventType, function (eventType) {

                var r,
                    i,
                    target,
                    customEvent;

                BaseUtils.fillGroupsForEvent(eventType, eventData);

                // mouseenter
                eventType = eventData.type;
                var s = Special[eventType];

                var originalType = eventType;

                // where observers lie
                // mouseenter observer lies on mouseover
                if (s && s.typeFix) {
                    // mousemove
                    originalType = s.typeFix;
                }

                targets = DOM.query(targets);

                for (i = targets.length - 1; i >= 0; i--) {
                    target = targets[i];
                    customEvent = ObservableDOMEvent.getCustomEvent(target, originalType);
                    // bubbling
                    // html dom event defaults to bubble
                    if (!onlyHandlers && !customEvent) {
                        customEvent = new ObservableDOMEvent({
                            type: originalType,
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
            return DOMEvent.fire(targets, eventType, eventData, 1);
        },


        /**
         * copy event from src to dest
         * @member KISSY.Event
         * @param {HTMLElement} src srcElement
         * @param {HTMLElement} dest destElement
         * @private
         */
        clone: function (src, dest) {
            var eventDesc,
                events;
            if (!(eventDesc = ObservableDOMEvent.getCustomEvents(src))) {
                return;
            }
            var srcData = DOMEventUtils.data(src);
            if (srcData && srcData === DOMEventUtils.data(dest)) {
                // remove event data (but without dom attached listener)
                // which is copied from above DOM.data
                DOMEventUtils.removeData(dest);
            }
            events = eventDesc.events;
            S.each(events, function (customEvent, type) {
                S.each(customEvent.observers, function (observer) {
                    // context undefined
                    // 不能 this 写死在 handlers 中
                    // 否则不能保证 clone 时的 this
                    addInternal(dest, type, observer);
                });
            });
        }
    });

    return DOMEvent;
}, {
    requires: ['event/base',
        './utils',
        'dom', './special', './observable', './object']
});
/*
 2012-02-12 yiminghe@gmail.com note:
 - 普通 remove() 不管 filter 都会查，如果 fn context 相等就移除
 - undelegate() filter 为 ''，那么去除所有委托绑定的 handler
 */
