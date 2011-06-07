/**
 * @module  event
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/base', function(S, DOM, EventObject, undefined) {

    var doc = document,
        isNodeList = DOM._isNodeList,
        simpleAdd = doc.addEventListener ?
            function(el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function(el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            },
        SPACE = " ",
        // 事件存储位置 key
        // { handler: eventHandler, events:  {type:[{scope:scope,fn:fn}]}  } }
        EVENT_GUID = 'ksEventTargetId' + S.now();


    var Event = {

        EVENT_GUID: EVENT_GUID,

        // such as: { 'mouseenter' : { fix: 'mouseover', handle: fn } }
        special: { },

        /**
         * Adds an event listener.
         * @param target {Element} An element or custom EventTarget to assign the listener to.
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        add: function(target, type, fn, scope /* optional */) {
            if (batch('add', target, type, fn, scope)) {
                return;
            }


            var isNativeEventTarget = !target.isCustomEventTarget,
                special,
                events,
                eventHandle,
                eventDesc;

            // 不是有效的 target 或 参数不对
            if (!target ||
                !type ||
                !S.isFunction(fn) ||
                (!isNativeEventTarget && !isValidTarget(target))) {
                return;
            }


            // 获取事件描述
            eventDesc = DOM.data(target, EVENT_GUID);
            if (!eventDesc) {
                DOM.data(target, EVENT_GUID, eventDesc = {});
            }
            //事件 listeners 
            events = eventDesc.events = eventDesc.events || {};
            events[type] = events[type] || [];
            eventHandle = eventDesc.handler;

            // 该元素没有 handler
            if (!eventHandle) {
                eventHandle = eventDesc.handler = function(event, data) {
                    var target = eventHandle.target;
                    if (!event || !event.fixed) {
                        event = new EventObject(target, event);
                    }
                    if (S.isPlainObject(data)) {
                        S.mix(event, data);
                    }
                    return Event._handle(target, event);
                };
                eventHandle.target = target;
            }

            special = Event.special[type] || {};


            if ((!special.setup || special.setup(eventHandle) === false) && isNativeEventTarget) {
                simpleAdd(target, type, eventHandle)
            }
            // 增加 listener
            events[type].push({fn: fn, scope: scope || target});

            //nullify to prevent memory leak in ie ?
            target = null;
        },

        __getListeners:function(target, type) {
            var events = Event.__getEvents(target) || {};
            return events[type] || [];
        },
        __getEvents:function(target) {
            // 获取事件描述
            var eventDesc = DOM.data(target, EVENT_GUID);
            return eventDesc && eventDesc.events;
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(target, type /* optional */, fn /* optional */, scope /* optional */) {
            if (batch('remove', target, type, fn, scope)) {
                return;
            }

            var events = Event.__getEvents(target),
                eventsType,
                listeners,
                len,
                i,
                j,
                t,
                isNativeEventTarget = !target.isCustomEventTarget,
                special = (isNativeEventTarget && Event.special[type]) || { };
            if (!target ||
                (!isNativeEventTarget && !isValidTarget(target)) ||
                events === undefined) {
                return;
            }
            // remove all types of event
            if (type === undefined) {
                for (type in events) {
                    Event.remove(target, type, undefined, undefined);
                }
                return;
            }

            scope = scope || target;

            if ((listeners = events[type])) {

                len = listeners.length;
                // 移除 fn
                if (S.isFunction(fn) && len) {
                    for (i = 0,j = 0,t = []; i < len; ++i) {
                        if (fn !== listeners[i].fn
                            || scope !== listeners[i].scope) {
                            t[j++] = listeners[i];
                        }
                    }
                    events[type] = t;
                    len = t.length;
                }

                // remove(el, type) or fn 已移除光
                if (fn === undefined || len === 0) {
                    if (!target.isCustomEventTarget) {
                        special = Event.special[type] || { };
                        if (!special.teardown || special.teardown(target) === false) {
                            simpleRemove(target, special.fix || type, eventsType.handle);
                        }
                    }
                    delete events[type];
                }
            }

            // remove expando
            if (S.isEmptyObject(events)) {
                var eventDesc = DOM.data(target, EVENT_GUID);
                if (eventDesc) {
                    eventDesc.handler.target = null;
                    delete eventDesc.handler;
                    delete eventDesc.events;
                    DOM.removeData(target, EVENT_GUID);
                }
            }


        },

        _handle: function(target, event) {
            /* As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.*/
            var listeners = Event.__getListeners(target, event.type).slice(0),
                ret,
                gRet,
                i = 0,
                len = listeners.length,
                listener;

            for (; i < len; ++i) {
                listener = listeners[i];
                ret = listener.fn.call(listener.scope, event);
                //有一个 false，最终结果就是 false
                if (gRet !== false) {
                    gRet = ret;
                }
                // 和 jQuery 逻辑保持一致
                // return false 等价 preventDefault + stopProgation
                if (ret !== undefined) {
                    // no use
                    // event.result = ret;
                    if (ret === false) {
                        event.halt();
                    }
                }
                if (event.isImmediatePropagationStopped) {
                    break;
                }
            }

            return gRet;
        },

        /**
         * fire event , simulate bubble in browser
         */
        fire:function(targets, eventType, eventData) {
            var ret;

            DOM.query(targets).each(function(target) {
                var isNativeEventTarget = !target.isCustomEventTarget;
                // 自定义事件很简单，不需要冒泡，不需要默认事件处理
                eventData = eventData || {};
                eventData.type = eventType;
                if (!isNativeEventTarget) {
                    var eventDesc = DOM.data(this, Event.EVENT_GUID);
                    if (eventDesc && S.isFunction(eventDesc.handle)) {
                        ret = eventDesc.handle(undefined, eventData);
                    }
                } else {
                    if (!isValidTarget(target)) {
                        return;
                    }
                    var event = new EventObject(target, eventData);
                    event.target = target;
                    var cur = target,
                        ontype = "on" + eventType;
                    //bubble up dom tree
                    do{
                        var handler = (DOM.data(cur, EVENT_GUID) || {}).handler;
                        event.currentTarget = cur;
                        if (handler) {
                            handler.call(cur, event);
                        }
                        // Trigger an inline bound script
                        if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                            ret = false;
                            event.preventDefault();
                        }
                        // Bubble up to document, then to window
                        cur = cur.parentNode || cur.ownerDocument || cur === target.ownerDocument && window;
                    } while (cur && !event.isPropagationStopped);

                    if (!event.isDefaultPrevented) {
                        if (!(eventType !== "click" && target.nodeName.toLowerCase() == "a")) {
                            var old;
                            try {
                                if (ontype && target[ eventType ]) {
                                    // Don't re-trigger an onFOO event when we call its FOO() method
                                    old = target[ ontype ];

                                    if (old) {
                                        target[ ontype ] = null;
                                    }

                                    target[ eventType ]();
                                }
                            } catch (ieError) {
                            }

                            if (old) {
                                target[ ontype ] = old;
                            }
                        }
                    }
                }
            });
            return ret;
        },

        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;
    Event.detach = Event.remove;

    function batch(methodName, targets, types, fn, scope) {
        // on('#id tag.className', type, fn)
        if (S.isString(targets)) {
            targets = DOM.query(targets);
        }

        // on([targetA, targetB], type, fn)
        if (S.isArray(targets) || isNodeList(targets)) {
            S.each(targets, function(target) {
                Event[methodName](target, types, fn, scope);
            });
            return true;
        }

        // on(target, 'click focus', fn)
        if ((types = S.trim(types)) && types.indexOf(SPACE) > 0) {
            S.each(types.split(SPACE), function(type) {
                Event[methodName](targets, type, fn, scope);
            });
            return true;
        }
        return undefined;
    }

    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target && target.nodeType !== 3 && target.nodeType !== 8;
    }

    if (1 > 2) {
        Event._simpleAdd()._simpleRemove();
    }

    return Event;
}, {
        requires:["dom","event/object"]
    });

/**
 * 承玉：2011-06-07
 *  - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 *  - 减少闭包使用，prevent ie 内存泄露？
 *  - 增加 fire ，模拟冒泡处理 dom 事件
 *  - TODO: 自定义事件和 dom 事件操作分离?
 *
 * TODO:
 *   - event || window.event, 什么情况下取 window.event ? IE4 ?
 *   - 更详尽细致的 test cases
 *   - 内存泄漏测试
 *   - target 为 window, iframe 等特殊对象时的 test case
 *   - special events 的 teardown 方法缺失，需要做特殊处理
 */
