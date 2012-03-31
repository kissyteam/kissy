/**
 * @fileOverview responsible for registering event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/add", function (S, Event, DOM, Utils, EventObject, handle, _data, specials) {
    var simpleAdd = Utils.simpleAdd,
        isValidTarget = Utils.isValidTarget,
        isIdenticalHandler = Utils.isIdenticalHandler;

    /**
     * dom node need eventHandler attached to dom node
     */
    function addDomEvent(target, type, eventHandler, handlers, handleObj) {
        var special = specials[type] || {};
        // 第一次注册该事件，dom 节点才需要注册 dom 事件
        if (!handlers.length &&
            (!special.setup || special.setup.call(target) === false)) {
            simpleAdd(target, type, eventHandler)
        }
        if (special.add) {
            special.add.call(target, handleObj);
        }
    }

    /**
     * @exports Event as Event
     */

    S.mix(Event,
        /**
         * @lends Event
         */
        {
            // single type , single target , fixed native
            __add:function (isNativeTarget, target, type, fn, scope) {
                var typedGroups = Utils.getTypedGroups(type);
                type = typedGroups[0];
                var groups = typedGroups[1],
                    eventDesc,
                    data,
                    s = specials[type],
                    // in case overwrite by delegateFix/onFix in specials events
                    // (mouseenter/leave,focusin/out)
                    originalType,
                    last,
                    selector;
                if (S.isObject(fn)) {
                    last = fn.last;
                    scope = fn.scope;
                    data = fn.data;
                    selector = fn.selector;
                    // in case provided by clone
                    originalType = fn.originalType;
                    fn = fn.fn;
                    if (selector && !originalType) {
                        if (s && s['delegateFix']) {
                            originalType = type;
                            type = s['delegateFix'];
                        }
                    }
                }
                if (!selector && !originalType) {
                    // when on mouseenter , it's actually on mouseover , and handlers is saved with mouseover!
                    // TODO need evaluate!
                    if (s && s['onFix']) {
                        originalType = type;
                        type = s['onFix'];
                    }
                }
                // 不是有效的 target 或 参数不对
                if (!type ||
                    !target ||
                    !S.isFunction(fn) ||
                    (isNativeTarget && !isValidTarget(target))) {
                    return;
                }
                // 获取事件描述
                eventDesc = Event._data(target);
                if (!eventDesc) {
                    _data._data(target, eventDesc = {});
                }
                //事件 listeners , similar to eventListeners in DOM3 Events
                var events = eventDesc.events = eventDesc.events || {},
                    handlers = events[type] = events[type] || [],
                    handleObj = {
                        fn:fn,
                        scope:scope,
                        selector:selector,
                        last:last,
                        data:data,
                        groups:groups,
                        originalType:originalType
                    },
                    eventHandler = eventDesc.handler;
                // 该元素没有 handler ，并且该元素是 dom 节点时才需要注册 dom 事件
                if (!eventHandler) {
                    eventHandler = eventDesc.handler = function (event, data) {
                        // 是经过 fire 手动调用而浏览器同步触发导致的，就不要再次触发了，
                        // 已经在 fire 中 bubble 过一次了
                        // incase after page has unloaded
                        if (typeof KISSY == "undefined" ||
                            event && event.type == Utils.Event_Triggered) {
                            return;
                        }
                        var currentTarget = eventHandler.target, type;
                        if (!event || !event.fixed) {
                            event = new EventObject(currentTarget, event);
                        }
                        type = event.type;
                        if (S.isPlainObject(data)) {
                            S.mix(event, data);
                        }
                        // protect type
                        if (type) {
                            event.type = type;
                        }
                        return handle(currentTarget, event);
                    };
                    // as for native dom event , this represents currentTarget !
                    eventHandler.target = target;
                }

                for (var i = handlers.length - 1; i >= 0; --i) {
                    /**
                     * If multiple identical EventListeners are registered on the same EventTarget
                     * with the same parameters the duplicate instances are discarded.
                     * They do not cause the EventListener to be called twice
                     * and since they are discarded
                     * they do not need to be removed with the removeEventListener method.
                     */
                    if (isIdenticalHandler(handlers[i], handleObj, target)) {
                        return;
                    }
                }

                if (isNativeTarget) {
                    addDomEvent(target, type, eventHandler, handlers, handleObj);
                    //nullify to prevent memory leak in ie ?
                    target = null;
                }

                // 增加 listener
                if (selector) {
                    var delegateIndex = handlers.delegateCount
                        = handlers.delegateCount || 0;
                    handlers.splice(delegateIndex, 0, handleObj);
                    handlers.delegateCount++;
                } else {
                    handlers.lastCount = handlers.lastCount || 0;
                    if (last) {
                        handlers.push(handleObj);
                        handlers.lastCount++;
                    } else {
                        handlers.splice(handlers.length - handlers.lastCount,
                            0, handleObj);
                    }
                }
            },

            /**
             * Adds an event listener.similar to addEventListener in DOM3 Events
             * @param targets KISSY selector
             * @param type {String} The type of event to append.use space to separate multiple event types.
             * @param fn {Function} The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            add:function (targets, type, fn, scope) {
                type = S.trim(type);
                // data : 附加在回调后面的数据，delegate 检查使用
                // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
                if (Utils.batchForType(Event.add, targets, type, fn, scope)) {
                    return targets;
                }
                targets = DOM.query(targets);
                for (var i = targets.length - 1; i >= 0; i--) {
                    Event.__add(true, targets[i], type, fn, scope);
                }
                return targets;
            }
        });
}, {
    requires:['./base', 'dom', './utils', './object', './handle', './data', './special']
});