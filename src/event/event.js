/**
 * @module  event
 * @author  lifesinger@gmail.com
 */
KISSY.add('event', function(S, undefined) {

    var doc = document,
        DOM = S.DOM,
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
        EVENT_GUID = 'ksEventTargetId',
        SPACE = ' ',
        guid = S.now(),
        // { id: { target: el, events: { type: { handle: obj, listeners: [...] } } }, ... }
        cache = { };

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
            if (batch('add', target, type, fn, scope)) return;

            var id = getID(target), isNativeEventTarget,
                special, events, eventHandle, fixedType, capture;

            // 不是有效的 target 或 参数不对
            if (id === -1 || !type || !S.isFunction(fn)) return;

            // 还没有添加过任何事件
            if (!id) {
                setID(target, (id = guid++));
                cache[id] = {
                    target: target,
                    events: { }
                };
            }

            // 没有添加过该类型事件
            events = cache[id].events;
            if (!events[type]) {
                isNativeEventTarget = !target.isCustomEventTarget;
                special = ((isNativeEventTarget || target._supportSpecialEvent) && Event.special[type]) || { };

                eventHandle = function(event, eventData) {
                    if (!event || !event.fixed) {
                        event = new S.EventObject(target, event, type);
                        if (S.isPlainObject(eventData)) {
                            S.mix(event, eventData);
                        }
                    }
                    if (special['setup']) {
                        special['setup'](event);
                    }
                    return (special.handle || Event._handle)(target, event, events[type].listeners);
                };

                events[type] = {
                    handle: eventHandle,
                    listeners: []
                };

                fixedType = special.fix || type;
                capture = special['capture'];
                if (isNativeEventTarget) {
                    simpleAdd(target, fixedType, eventHandle, capture);
                } else if (target._addEvent) { // such as Node
                    target._addEvent(fixedType, eventHandle, capture);
                }
            }

            // 增加 listener
            events[type].listeners.push({fn: fn, scope: scope || target});
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(target, type /* optional */, fn /* optional */, scope /* optional */) {
            if (batch('remove', target, type, fn, scope)) return;

            var id = getID(target),
                events, eventsType, listeners,
                i, j, len, c, t, special;

            if (id === -1) return; // 不是有效的 target
            if (!id || !(c = cache[id])) return; // 无 cache
            if (c.target !== target) return; // target 不匹配
            scope = scope || target;
            events = c.events || { };
            
            if ((eventsType = events[type])) {
                listeners = eventsType.listeners;
                len = listeners.length;

                // 移除 fn
                if (S.isFunction(fn) && len) {
                    for (i = 0, j = 0, t = []; i < len; ++i) {
                        if (fn !== listeners[i].fn
                            || scope !== listeners[i].scope) {
                            t[j++] = listeners[i];
                        }
                    }
                    eventsType.listeners = t;
                    len = t.length;
                }

                // remove(el, type) or fn 已移除光
                if (fn === undefined || len === 0) {
                    if (!target.isCustomEventTarget) {
                        special = Event.special[type] || { };
                        simpleRemove(target, special.fix || type, eventsType.handle);
                    }
                    else if (target._addEvent) { // such as Node
                        target._removeEvent(type, eventsType.handle);
                    }
                    delete events[type];
                }
            }

            // remove(el) or type 已移除光
            if (type === undefined || S.isEmptyObject(events)) {
                for (type in events) {
                    Event.remove(target, type);
                }
                delete cache[id];
                removeID(target);
            }
        },

        _handle: function(target, event, listeners) {
            /* As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.*/
            listeners = listeners.slice(0);

            var ret, i = 0, len = listeners.length, listener;

            for (; i < len; ++i) {
                listener = listeners[i];
                ret = listener.fn.call(listener.scope || target, event);

                // 自定义事件对象，可以用 return false 来立刻停止后续监听函数
                // 注意：return false 仅停止当前 target 的后续监听函数，并不会阻止冒泡
                // 目前没有实现自定义事件对象的冒泡，因此 return false 和 stopImmediatePropagation 效果是一样的
                if ((ret === false && target.isCustomEventTarget) ||
                    event.isImmediatePropagationStopped) {
                    break;
                }
            }

            return ret;
        },

        _getCache: function(id) {
            return cache[id];
        },

        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;

    function batch(methodName, targets, types, fn, scope) {
        // on('#id tag.className', type, fn)
        if (S.isString(targets)) {
            targets = S.query(targets);
        }

        // on([targetA, targetB], type, fn)
        if (S.isArray(targets)) {
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
    }

    function getID(target) {
        return isValidTarget(target) ? DOM.data(target, EVENT_GUID) : -1;
    }

    function setID(target, id) {
        if (isValidTarget(target)) {
            DOM.data(target, EVENT_GUID, id);
        }
    }

    function removeID(target) {
        DOM.removeData(target, EVENT_GUID);
    }

    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target && target.nodeType !== 3 && target.nodeType !== 8;
    }

    S.Event = Event;
});

/**
 * TODO:
 *   - event || window.event, 什么情况下取 window.event ? IE4 ?
 *   - 更详尽细致的 test cases
 *   - 内存泄漏测试
 *   - target 为 window, iframe 等特殊对象时的 test case
 *   - special events 的 teardown 方法缺失，需要做特殊处理
 */
