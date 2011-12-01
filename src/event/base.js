/**
 * scalable event framework for kissy (refer DOM3 Events)
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('event/base', function(S, DOM, EventObject, Utils, undefined) {

    var isValidTarget = Utils.isValidTarget,
        isIdenticalHandler = Utils.isIdenticalHandler,
        batchForType = Utils.batchForType,
        simpleRemove = Utils.simpleRemove,
        simpleAdd = Utils.simpleAdd,
        splitAndRun = Utils.splitAndRun,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        each = S.each,
        trim = S.trim,
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器通知的系统 eventHandler 中检查
        // 如果相同，那么证明已经 fire 过了，不要再次触发了
        Event_Triggered = "",
        TRIGGERED_NONE = "trigger-none-" + S.now(),
        EVENT_SPECIAL = {},
        // 事件存储位置 key
        // { handler: eventHandler, events:  {type:[{scope:scope,fn:fn}]}  } }
        EVENT_GUID = 'ksEventTargetId' + S.now();

    /**
     * @name Event
     * @namespace
     */
    var Event = {

        _clone:function(src, dest) {
            if (dest.nodeType !== DOM.ELEMENT_NODE ||
                !Event._hasData(src)) {
                return;
            }
            var eventDesc = Event._data(src),
                events = eventDesc.events;
            each(events, function(handlers, type) {
                each(handlers, function(handler) {
                    // scope undefined 时不能写死在 handlers 中，否则不能保证 clone 时的 this
                    Event.on(dest, type, handler.fn, handler.scope, handler.data);
                });
            });
        },

        _hasData:function(elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        _data:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },

        _removeData:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        },

        // such as: { 'mouseenter' : { setup:fn ,tearDown:fn} }
        special: EVENT_SPECIAL,

        // single type , single target , fixed native
        __add:function(isNativeTarget, target, type, fn, scope, data) {
            var eventDesc;

            // 不是有效的 target 或 参数不对
            if (!target ||
                !S.isFunction(fn) ||
                (isNativeTarget && !isValidTarget(target))) {
                return;
            }
            // 获取事件描述
            eventDesc = Event._data(target);
            if (!eventDesc) {
                Event._data(target, eventDesc = {});
            }
            //事件 listeners , similar to eventListeners in DOM3 Events
            var events = eventDesc.events = eventDesc.events || {},
                handlers = events[type] = events[type] || [],
                handleObj = {
                    fn: fn,
                    scope: scope,
                    data:data
                },
                eventHandler = eventDesc.handler;
            // 该元素没有 handler ，并且该元素是 dom 节点时才需要注册 dom 事件
            if (!eventHandler) {
                eventHandler = eventDesc.handler = function(event, data) {
                    // 是经过 fire 手动调用而浏览器同步触发导致的，就不要再次触发了，
                    // 已经在 fire 中 bubble 过一次了
                    if (event && event.type == Event_Triggered) {
                        return;
                    }
                    var target = eventHandler.target;
                    if (!event || !event.fixed) {
                        event = new EventObject(target, event);
                    }
                    var type = event.type;
                    if (S.isPlainObject(data)) {
                        S.mix(event, data);
                    }
                    // protect type
                    if (type) {
                        event.type = type;
                    }
                    return _handle(target, event);
                };
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
            handlers.push(handleObj);
        },

        /**
         * Adds an event listener.similar to addEventListener in DOM3 Events
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler/listener.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        add: function(targets, type, fn, scope /* optional */, data/*internal usage*/) {
            type = trim(type);
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
            if (batchForType(Event, 'add', targets, type, fn, scope, data)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                Event.__add(true, target, type, fn, scope, data);
            });

            return targets;
        },

        // single target, single type, fixed native
        __remove:function(isNativeTarget, target, type, fn, scope, data) {

            if (
                !target ||
                    (isNativeTarget && !isValidTarget(target))
                ) {
                return;
            }

            var eventDesc = Event._data(target),
                events = eventDesc && eventDesc.events,
                handlers,
                len,
                i,
                j,
                t,
                special = (isNativeTarget && EVENT_SPECIAL[type]) || { };

            if (!events) {
                return;
            }

            // remove all types of event
            if (!type) {
                for (type in events) {
                    Event.__remove(isNativeTarget, target, type);
                }
                return;
            }

            if ((handlers = events[type])) {
                len = handlers.length;
                // 移除 fn
                if (fn && len) {
                    var currentHandler = {
                        data:data,
                        fn:fn,
                        scope:scope
                    },handler;

                    for (i = 0,j = 0,t = []; i < len; ++i) {
                        handler = handlers[i];
                        // 注意顺序，用户提供的 handler 在第二个参数
                        if (!isIdenticalHandler(handler, currentHandler, target)) {
                            t[j++] = handler;
                        } else if (special.remove) {
                            special.remove.call(target, handler);
                        }
                    }

                    events[type] = t;
                    len = t.length;
                }

                // remove(el, type) or fn 已移除光
                if (fn === undefined || len === 0) {
                    // dom node need to detach handler from dom node
                    if (isNativeTarget &&
                        (!special['tearDown'] ||
                            special['tearDown'].call(target) === false)) {
                        simpleRemove(target, type, eventDesc.handler);
                    }
                    // remove target's single event description
                    delete events[type];
                }
            }

            // remove target's  all events description
            if (S.isEmptyObject(events)) {
                eventDesc.handler.target = null;
                delete eventDesc.handler;
                delete eventDesc.events;
                Event._removeData(target);
            }
        },

        /**
         * Detach an event or set of events from an element. similar to removeEventListener in DOM3 Events
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler/listener.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        remove: function(targets, type /* optional */, fn /* optional */, scope /* optional */, data/*internal usage*/) {
            type = trim(type);
            if (batchForType(Event, 'remove', targets, type, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                Event.__remove(true, target, type, fn, scope, data);
            });
            return targets;
        },

        _handle:_handle,

        /**
         * fire event , simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @return boolean The return value of fire/dispatchEvent indicates
         *                 whether any of the listeners which handled the event called preventDefault.
         *                 If preventDefault was called the value is false, else the value is true.
         */
        fire: function(targets, eventType, eventData, onlyHandlers) {
            var ret = true;
            eventType = trim(eventType);
            if (eventType.indexOf(" ") > -1) {
                splitAndRun(eventType, function(t) {
                    ret = Event.fire(targets, t, eventData, onlyHandlers) && ret;
                });
                return ret;
            }
            // custom event firing moved to target.js
            eventData = eventData || {};
            // protect event type
            eventData.type = eventType;
            DOM.query(targets).each(function(target) {
                ret = fireDOMEvent(target, eventType, eventData, onlyHandlers) && ret;
            });
            return ret;
        },
        __getListeners:getListeners
    };

    // shorthand
    Event.on = Event.add;
    Event.detach = Event.remove;

    function getListeners(target, type) {
        var events = getEvents(target) || {};
        return events[type] || [];
    }

    function _handle(target, event) {
        /* As some listeners may remove themselves from the
         event, the original array length is dynamic. So,
         let's make a copy of all listeners, so we are
         sure we'll call all of them.*/
        /**
         * DOM3 Events: EventListenerList objects in the DOM are live. ??
         */
        var listeners = getListeners(target, event.type).slice(0),
            ret,
            gRet,
            i = 0,
            len = listeners.length,
            listener;

        for (; i < len; ++i) {
            listener = listeners[i];
            // 传入附件参数data，目前用于委托
            // scope undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
            ret = listener.fn.call(listener.scope || target,
                event, listener.data);

            // 和 jQuery 逻辑保持一致
            if (ret !== undefined) {
                // 有一个 false，最终结果就是 false
                // 否则等于最后一个返回值
                if (gRet !== false) {
                    gRet = ret;
                }
                // return false 等价 preventDefault + stopProgation
                if (ret === false) {
                    event.halt();
                }
            }

            if (event.isImmediatePropagationStopped) {
                break;
            }
        }

        // fire 时判断如果 preventDefault，则返回 false 否则返回 true
        // 这里返回值意义不同
        return gRet;
    }

    function getEvents(target) {
        // 获取事件描述
        var eventDesc = Event._data(target);
        return eventDesc && eventDesc.events;
    }

    /**
     * dom node need eventHandler attached to dom node
     */
    function addDomEvent(target, type, eventHandler, handlers, handleObj) {
        var special = EVENT_SPECIAL[type] || {};
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
     * fire dom event from bottom to up , emulate dispatchEvent in DOM3 Events
     * @return boolean The return value of dispatchEvent indicates
     *                 whether any of the listeners which handled the event called preventDefault.
     *                 If preventDefault was called the value is false, else the value is true.
     */
    function fireDOMEvent(target, eventType, eventData, onlyHandlers) {
        if (!isValidTarget(target)) {
            return false;
        }

        var event,
            ret = true;
        if (eventData instanceof EventObject) {
            event = eventData;
        } else {
            event = new EventObject(target, undefined, eventType);
            S.mix(event, eventData);
        }
        /*
         The target of the event is the EventTarget on which dispatchEvent is called.
         */
        // TODO: protect target , but incompatible
        // event.target=target;
        // protect type
        event.type = eventType;
        // 只运行自己的绑定函数，不冒泡也不触发默认行为
        if (onlyHandlers) {
            event.halt();
        }
        var cur = target,
            ontype = "on" + eventType;

        //bubble up dom tree
        do{
            event.currentTarget = cur;
            _handle(cur, event);
            // Trigger an inline bound script
            if (cur[ ontype ] &&
                cur[ ontype ].call(cur) === false) {
                event.preventDefault();
            }
            // Bubble up to document, then to window
            cur = cur.parentNode ||
                cur.ownerDocument ||
                cur === target.ownerDocument && window;
        } while (cur && !event.isPropagationStopped);

        if (!event.isDefaultPrevented) {
            if (!(eventType === "click" &&
                nodeName(target, "a"))) {
                var old;
                try {
                    if (ontype && target[ eventType ]) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = target[ ontype ];

                        if (old) {
                            target[ ontype ] = null;
                        }

                        // 记录当前 trigger 触发
                        Event_Triggered = eventType;

                        // 只触发默认事件，而不要执行绑定的用户回调
                        // 同步触发
                        target[ eventType ]();
                    }
                } catch (ieError) {
                    S.log("trigger action error : ");
                    S.log(ieError);
                }

                if (old) {
                    target[ ontype ] = old;
                }

                Event_Triggered = TRIGGERED_NONE;
            }
        } else {
            ret = false;
        }
        return ret;
    }

    return Event;
}, {
    requires:["dom","./object","./utils"]
});

/**
 * 2011-11-24
 *  - 自定义事件和 dom 事件操作彻底分离
 *  - TODO: group event from DOM3 Event
 *
 * 2011-06-07
 *  - refer : http://www.w3.org/TR/2001/WD-DOM-Level-3-Events-20010823/events.html
 *  - 重构
 *  - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 *  - 减少闭包使用，prevent ie 内存泄露？
 *  - 增加 fire ，模拟冒泡处理 dom 事件
 */
