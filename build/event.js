/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
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
                    fn = fn.fn;
                    if (selector) {
                        if (s && s['delegateFix']) {
                            originalType = type;
                            type = s['delegateFix'];
                        }
                    }
                }
                if (!selector) {
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
                targets=DOM.query(targets);
                for(var i=targets.length-1;i>=0;i--){
                    Event.__add(true, targets[i], type, fn, scope);
                }
                return targets;
            }
        });
}, {
    requires:['./base', 'dom', './utils', './object', './handle', './data', './special']
});/**
 * @fileOverview scalable event framework for kissy (refer DOM3 Events)
 *               how to fire event just like browser?
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('event/base', function (S, DOM, EventObject, Utils, handle, _data, special) {

    var isValidTarget = Utils.isValidTarget,
        splitAndRun = Utils.splitAndRun,
        nodeName = DOM._nodeName,
        trim = S.trim,
        TRIGGERED_NONE = Utils.TRIGGERED_NONE;

    /**
     * @namespace The event utility provides functions to add and remove event listeners.
     * @name Event
     */
    var Event =
    /**
     * @lends Event
     */
    {

        _clone:function (src, dest) {
            if (dest.nodeType !== DOM.ELEMENT_NODE ||
                !_data._hasData(src)) {
                return;
            }
            var eventDesc = _data._data(src),
                events = eventDesc.events;
            S.each(events, function (handlers, type) {
                S.each(handlers, function (handler) {
                    // scope undefined 时不能写死在 handlers 中，否则不能保证 clone 时的 this
                    Event.on(dest, type, {
                        fn:handler.fn,
                        scope:handler.scope,
                        data:handler.data,
                        originalType:handler.originalType,
                        selector:handler.selector
                    });
                });
            });
        },

        /**
         * fire event,simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @memberOf Event
         * @param targets html nodes
         * @param {String|Event.Object} eventType event type
         * @param [eventData] additional event data
         * @param {boolean} [onlyHandlers] only fire handlers
         * @returns {boolean} The return value of fire/dispatchEvent indicates
         *                 whether any of the listeners which handled the event called preventDefault.
         *                 If preventDefault was called the value is false, else the value is true.
         */
        fire:function (targets, eventType, eventData, onlyHandlers/*internal usage*/) {
            var ret = true, r;
            // custom event firing moved to target.js
            eventData = eventData || {};
            if (S.isString(eventType)) {
                eventType = trim(eventType);
                if (eventType.indexOf(" ") > -1) {
                    splitAndRun(eventType, function (t) {
                        r = Event.fire(targets, t, eventData, onlyHandlers);
                        if (ret !== false) {
                            ret = r;
                        }
                    });
                    return ret;
                }
                // protect event type
                eventData.type = eventType;
            } else if (eventType instanceof EventObject) {
                eventData = eventType;
                eventType = eventData.type;
            }

            var typedGroups = Utils.getTypedGroups(eventType),
                _ks_groups = typedGroups[1];

            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }

            eventType = typedGroups[0];

            S.mix(eventData, {
                type:eventType,
                _ks_groups:_ks_groups
            });

            targets = DOM.query(targets);
            for (var i = targets.length - 1; i >= 0; i--) {
                r = fireDOMEvent(targets[i], eventType, eventData, onlyHandlers);
                if (ret !== false) {
                    ret = r;
                }
            }
            return ret;
        },

        /**
         * does not cause default behavior to occur
         * does not bubble up the DOM hierarchy
         * @param targets
         * @param {Event.Object | String} eventType
         * @param [eventData]
         */
        fireHandler:function (targets, eventType, eventData) {
            return Event.fire(targets, eventType, eventData, 1);
        }
    };

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
        var s = special[eventType];
        // TODO bug : when fire mouseenter , it also fire mouseover in firefox/chrome
        if (s && s['onFix']) {
            eventType = s['onFix'];
        }

        var event,
            ret = true;
        if (eventData instanceof EventObject) {
            event = eventData;
        } else {
            event = new EventObject(target, undefined, eventType);
            S.mix(event, eventData);
        }
        /**
         * identify event as fired manually
         */
        event._ks_fired = 1;
        /*
         The target of the event is the EventTarget on which dispatchEvent is called.
         */
        // TODO: protect target , but incompatible
        // event.target=target;
        // protect type
        event.type = eventType;

        // onlyHandlers is equal to event.halt()
        // but we can not call event.halt()
        // because handle will check event.isPropagationStopped

        var cur = target,
            t,
            win = DOM._getWin(cur.ownerDocument || cur),
            ontype = "on" + eventType;

        //bubble up dom tree
        do {
            event.currentTarget = cur;
            t = handle(cur, event);
            if (ret !== false) {
                ret = t;
            }
            // Trigger an inline bound script
            if (cur[ ontype ] &&
                cur[ ontype ].call(cur) === false) {
                event.preventDefault();
            }
            // Bubble up to document, then to window
            cur = cur.parentNode ||
                cur.ownerDocument ||
                (cur === target.ownerDocument) && win;
        } while (!onlyHandlers && cur && !event.isPropagationStopped);

        if (!onlyHandlers && !event.isDefaultPrevented) {
            if (!(eventType === "click" &&
                nodeName(target, "a"))) {
                var old;
                try {
                    // execute default action on dom node
                    // so exclude window
                    // exclude focus/blue on hidden element
                    if (ontype &&
                        target[ eventType ] &&
                        (
                            (eventType !== "focus" && eventType !== "blur") ||
                                target.offsetWidth !== 0
                            ) &&
                        !S.isWindow(target)) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = target[ ontype ];

                        if (old) {
                            target[ ontype ] = null;
                        }

                        // 记录当前 trigger 触发
                        Utils.Event_Triggered = eventType;

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

                Utils.Event_Triggered = TRIGGERED_NONE;
            }
        }
        return ret;
    }

    return Event;
}, {
    requires:["dom", "./object", "./utils", './handle', './data', './special']
});

/**
 * yiminghe@gmail.com : 2011-12-15
 *  - 重构，粒度更细，新的架构
 *
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
/**
 * @fileOverview  change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add("event/change", function (S, UA, Event, DOM, special) {
    var mode = S.Env.host.document['documentMode'];

    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {

        var rformElems = /^(?:textarea|input|select)$/i;

        function isFormElement(n) {
            return rformElems.test(n.nodeName);
        }

        function isCheckBoxOrRadio(el) {
            var type = el.type;
            return type == "checkbox" || type == "radio";
        }

        special['change'] = {
            setup:function () {
                var el = this;
                if (isFormElement(el)) {
                    // checkbox/radio only fires change when blur in ie<9
                    // so use another technique from jquery
                    if (isCheckBoxOrRadio(el)) {
                        // change in ie<9
                        // change = propertychange -> click
                        Event.on(el, "propertychange", propertyChange);
                        Event.on(el, "click", onClick);
                    } else {
                        // other form elements use native , do not bubble
                        return false;
                    }
                } else {
                    // if bind on parentNode ,lazy bind change event to its form elements
                    // note event order : beforeactivate -> change
                    // note 2: checkbox/radio is exceptional
                    Event.on(el, "beforeactivate", beforeActivate);
                }
            },
            tearDown:function () {
                var el = this;
                if (isFormElement(el)) {
                    if (isCheckBoxOrRadio(el)) {
                        Event.remove(el, "propertychange", propertyChange);
                        Event.remove(el, "click", onClick);
                    } else {
                        return false;
                    }
                } else {
                    Event.remove(el, "beforeactivate", beforeActivate);
                    S.each(DOM.query("textarea,input,select", el), function (fel) {
                        if (fel.__changeHandler) {
                            fel.__changeHandler = 0;
                            Event.remove(fel, "change", {fn:changeHandler, last:1});
                        }
                    });
                }
            }
        };

        function propertyChange(e) {
            if (e.originalEvent.propertyName == "checked") {
                this.__changed = 1;
            }
        }

        function onClick(e) {
            if (this.__changed) {
                this.__changed = 0;
                // fire from itself
                Event.fire(this, "change", e);
            }
        }

        function beforeActivate(e) {
            var t = e.target;
            if (isFormElement(t) && !t.__changeHandler) {
                t.__changeHandler = 1;
                // lazy bind change , always as last handler among user's handlers
                Event.on(t, "change", {fn:changeHandler, last:1});
            }
        }

        function changeHandler(e) {
            var fel = this;

            if (
            // in case stopped by user's callback,same with submit
            // http://bugs.jquery.com/ticket/11049
            // see : test/change/bubble.html
                e.isPropagationStopped ||
                    // checkbox/radio already bubble using another technique
                    isCheckBoxOrRadio(fel)) {
                return;
            }
            var p;
            if (p = fel.parentNode) {
                // fire from parent , itself is handled natively
                Event.fire(p, "change", e);
            }
        }

    }
}, {
    requires:["ua", "./base", "dom", './special']
});/**
 * @fileOverview for other kissy core usage
 * @author yiminghe@gmail.com
 */
KISSY.add("event/data", function (S, DOM, Utils) {
    var EVENT_GUID = Utils.EVENT_GUID,
        data,
        makeArray = S.makeArray;
    data = {
        _hasData:function (elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        _data:function (elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },

        _removeData:function (elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        }
    };
    return data;
}, {
    requires:['dom', './utils']
});/**
 * @fileOverview KISSY Scalable Event Framework
 */
KISSY.add("event", function (S, _data, KeyCodes, Event, Target, Object) {
    S.mix(Event,
        /**
         * @lends Event
         */
        {
            KeyCodes:KeyCodes,
            Target:Target,
            Object:Object,
            on:Event.add,
            detach:Event.remove,
            /**
             *
             * @param targets KISSY selector
             * @param {String} [eventType] The type of event to delegate.
             * use space to separate multiple event types.
             * @param {String|Function} selector filter selector string or function to find right element
             * @param {Function} [fn] The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            delegate:function (targets, eventType, selector, fn, scope) {
                return Event.add(targets, eventType, {
                    fn:fn,
                    scope:scope,
                    selector:selector
                });
            },
            /**
             * @param targets KISSY selector
             * @param {String} [eventType] The type of event to undelegate.
             * use space to separate multiple event types.
             * @param {String|Function} selector filter selector string or function to find right element
             * @param {Function} [fn] The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            undelegate:function (targets, eventType, selector, fn, scope) {
                return Event.remove(targets, eventType, {
                    fn:fn,
                    scope:scope,
                    selector:selector
                });
            }
        });

    S.mix(Event, _data);

    S.mix(S, {
        Event:Event,
        EventTarget:Event.Target,
        EventObject:Event.Object
    });

    return Event;
}, {
    requires:[
        "event/data",
        "event/keycodes",
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/mouseenter",
        "event/submit",
        "event/change",
        "event/mousewheel",
        "event/add",
        "event/remove"
    ]
});

/**
 *  2012-02-12 yiminghe@gmail.com note:
 *   - 普通 remove() 不管 selector 都会查，如果 fn scope 相等就移除
 *   - undelegate() selector 为 ""，那么去除所有委托绑定的 handler
 *//**
 * @fileOverview   event-focusin
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/focusin', function (S, UA, Event, special) {
    // 让非 IE 浏览器支持 focusin/focusout
    if (!UA['ie']) {
        S.each([
            { name:'focusin', fix:'focus' },
            { name:'focusout', fix:'blur' }
        ], function (o) {
            var key = S.guid("attaches_" + S.now() + "_")
            special[o.name] = {
                // 统一在 document 上 capture focus/blur 事件，然后模拟冒泡 fire 出来
                // 达到和 focusin 一样的效果 focusin -> focus
                // refer: http://yiminghe.iteye.com/blog/813255
                setup:function () {
                    // this maybe document
                    var doc = this.ownerDocument || this;
                    if (!(key in doc)) {
                        doc[key] = 0;
                    }
                    doc[key] += 1;
                    if (doc[key] === 1) {
                        doc.addEventListener(o.fix, handler, true);
                    }
                },

                tearDown:function () {
                    var doc = this.ownerDocument || this;
                    doc[key] -= 1;
                    if (doc[key] === 0) {
                        doc.removeEventListener(o.fix, handler, true);
                    }
                }
            };

            function handler(event) {
                var target = event.target;
                return Event.fire(target, o.name);
            }

        });
    }

    special["focus"] = {
        delegateFix:"focusin"
    };

    special["blur"] = {
        delegateFix:"focusout"
    };

    return Event;
}, {
    requires:["ua", "./base", './special']
});

/**
 * 承玉:2011-06-07
 * - refactor to jquery , 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 *
 * NOTES:
 *  - webkit 和 opera 已支持 DOMFocusIn/DOMFocusOut 事件，但上面的写法已经能达到预期效果，暂时不考虑原生支持。
 */
/**
 * @fileOverview responsible for handling event from browser to KISSY Event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/handle", function (S, DOM, _data, special) {

    function getEvents(target) {
        // 获取事件描述
        var eventDesc = _data._data(target);
        return eventDesc && eventDesc.events;
    }

    function getHandlers(target, type) {
        var events = getEvents(target) || {};
        return events[type] || [];
    }

    return function (currentTarget, event) {
        /*
         As some listeners may remove themselves from the
         event, the original array length is dynamic. So,
         let's make a copy of all listeners, so we are
         sure we'll call all of them.
         */
        /**
         * DOM3 Events: EventListenerList objects in the DOM are live. ??
         */
        var handlers = getHandlers(currentTarget, event.type),
            target = event.target,
            currentTarget0,
            allHandlers = [],
            ret,
            gRet,
            handlerObj,
            i,
            j,
            delegateCount = handlers.delegateCount || 0,
            len,
            currentTargetHandlers,
            currentTargetHandler,
            handler;

        // collect delegated handlers and corresponding element
        if (delegateCount &&
            // by jq
            // Avoid disabled elements in IE (#6911)
            // non-left-click bubbling in Firefox (#3861),firefox 8 fix it
            !target.disabled) {
            while (target != currentTarget) {
                currentTargetHandlers = [];
                for (i = 0; i < delegateCount; i++) {
                    handler = handlers[i];
                    if (DOM.test(target, handler.selector)) {
                        currentTargetHandlers.push(handler);
                    }
                }
                if (currentTargetHandlers.length) {
                    allHandlers.push({
                        currentTarget:target,
                        "currentTargetHandlers":currentTargetHandlers
                    });
                }
                target = target.parentNode || currentTarget;
            }
        }

        // root node's handlers is placed at end position of add handlers
        // in case child node stopPropagation of root node's handlers
        allHandlers.push({
            currentTarget:currentTarget,
            currentTargetHandlers:handlers.slice(delegateCount)
        });

        // backup eventType
        var eventType = event.type,
            s,
            t,
            _ks_groups = event._ks_groups;
        for (i = 0, len = allHandlers.length;
             !event.isPropagationStopped && i < len;
             ++i) {

            handlerObj = allHandlers[i];
            currentTargetHandlers = handlerObj.currentTargetHandlers;
            currentTarget0 = handlerObj.currentTarget;
            event.currentTarget = currentTarget0;
            for (j = 0; !event.isImmediatePropagationStopped &&
                j < currentTargetHandlers.length;
                 j++) {

                currentTargetHandler = currentTargetHandlers[j];

                // handler's group does not match specified groups (at fire step)
                if (_ks_groups &&
                    (!currentTargetHandler.groups ||
                        !(currentTargetHandler.groups.match(_ks_groups)))) {
                    continue;
                }

                var data = currentTargetHandler.data;

                // restore originalType if involving delegate/onFix handlers
                event.type = currentTargetHandler.originalType || eventType;

                // scope undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
                if ((s = special[event.type]) && s.handle) {
                    t = s.handle(event, currentTargetHandler, data);
                    // can handle
                    if (t.length > 0) {
                        ret = t[0];
                    }
                } else {
                    ret = currentTargetHandler.fn.call(
                        currentTargetHandler.scope || currentTarget,
                        event, data
                    );
                }
                // 和 jQuery 逻辑保持一致
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
        }

        // fire 时判断如果 preventDefault，则返回 false 否则返回 true
        // 这里返回值意义不同
        return gRet;
    }
}, {
    requires:['dom', './data', './special']
});/**
 * @fileOverview   event-hashchange
 * @author  yiminghe@gmail.com , xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function (S, Event, DOM, UA, special) {

    var win=S.Env.host,
        doc = win.document,
        docMode = doc['documentMode'],
        ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    // ie8 支持 hashchange
    // 但IE8以上切换浏览器模式到IE7（兼容模式），会导致 'onhashchange' in window === true，但是不触发事件

    // 1. 不支持 hashchange 事件，支持 hash 导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 导航(ie67) : iframe + 定时器
    if ((!( 'on' + HASH_CHANGE in win)) || ie && ie < 8) {


        function getIframeDoc(iframe) {
            return iframe.contentWindow.document;
        }

        var POLL_INTERVAL = 50,
            IFRAME_TEMPLATE = "<html><head><title>" + (doc.title || "") +
                " - {hash}</title>{head}</head><body>{hash}</body></html>",

            getHash = function () {
                // 不能 location.hash
                // http://xx.com/#yy?z=1
                // ie6 => location.hash = #yy
                // 其他浏览器 => location.hash = #yy?z=1
                var url = location.href;
                return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
            },

            timer,

            // 用于定时器检测，上次定时器记录的 hash 值
            lastHash,

            poll = function () {
                var hash = getHash();
                if (hash !== lastHash) {
                    // S.log("poll success :" + hash + " :" + lastHash);
                    // 通知完调用者 hashchange 事件前设置 lastHash
                    lastHash = hash;
                    // ie<8 同步 : hashChange -> onIframeLoad
                    hashChange(hash);
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie && ie < 8 ? function (hash) {
                // S.log("set iframe html :" + hash);

                var html = S.substitute(IFRAME_TEMPLATE, {
                    hash:hash,
                    // 一定要加哦
                    head:DOM._isCustomDomain() ? "<script>document.domain = '" +
                        doc.domain
                        + "';</script>" : ""
                }),
                    iframeDoc = getIframeDoc(iframe);
                try {
                    // 写入历史 hash
                    iframeDoc.open();
                    // 取时要用 innerText !!
                    // 否则取 innerHtml 会因为 escapeHtml 导置 body.innerHTMl != hash
                    iframeDoc.write(html);
                    iframeDoc.close();
                    // 立刻同步调用 onIframeLoad !!!!
                } catch (e) {
                    // S.log('doc write error : ', 'error');
                    // S.log(e, 'error');
                }
            } : function () {
                notifyHashChange();
            },

            notifyHashChange = function () {
                // S.log("hash changed : " + getHash());
                Event.fire(win, HASH_CHANGE);
            },
            setup = function () {
                if (!timer) {
                    poll();
                }
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = 0;
            },
            iframe;

        // ie6, 7, 覆盖一些function
        if (ie < 8) {

            /*
             前进后退 : start -> notifyHashChange
             直接输入 : poll -> hashChange -> start
             iframe 内容和 url 同步
             */
            setup = function () {
                if (!iframe) {
                    var iframeSrc = DOM._genEmptyIframeSrc();
                    //http://www.paciellogroup.com/blog/?p=604
                    iframe = DOM.create('<iframe ' +
                        (iframeSrc ? 'src="' + iframeSrc + '"' : '') +
                        ' style="display: none" ' +
                        'height="0" ' +
                        'width="0" ' +
                        'tabindex="-1" ' +
                        'title="empty"/>');
                    // Append the iframe to the documentElement rather than the body.
                    // Keeping it outside the body prevents scrolling on the initial
                    // page load
                    DOM.prepend(iframe, doc.documentElement);

                    // init，第一次触发，以后都是 onIframeLoad
                    Event.add(iframe, "load", function () {
                        Event.remove(iframe, "load");
                        // Update the iframe with the initial location hash, if any. This
                        // will create an initial history entry that the user can return to
                        // after the state has changed.
                        hashChange(getHash());
                        Event.add(iframe, "load", onIframeLoad);
                        poll();
                    });

                    // Whenever `document.title` changes, update the Iframe's title to
                    // prettify the back/next history menu entries. Since IE sometimes
                    // errors with "Unspecified error" the very first time this is set
                    // (yes, very useful) wrap this with a try/catch block.
                    doc.onpropertychange = function () {
                        try {
                            if (event.propertyName === 'title') {
                                getIframeDoc(iframe).title =
                                    doc.title + " - " + getHash();
                            }
                        } catch (e) {
                        }
                    };

                    /*
                     前进后退 ： onIframeLoad -> 触发
                     直接输入 : timer -> hashChange -> onIframeLoad -> 触发
                     触发统一在 start(load)
                     iframe 内容和 url 同步
                     */
                    function onIframeLoad() {
                        // S.log('iframe start load..');

                        // 2011.11.02 note: 不能用 innerHtml 会自动转义！！
                        // #/x?z=1&y=2 => #/x?z=1&amp;y=2
                        var c = S.trim(getIframeDoc(iframe).body.innerText),
                            ch = getHash();

                        // 后退时不等
                        // 定时器调用 hashChange() 修改 iframe 同步调用过来的(手动改变 location)则相等
                        if (c != ch) {
                            S.log("set loc hash :" + c);
                            location.hash = c;
                            // 使lasthash为 iframe 历史， 不然重新写iframe，
                            // 会导致最新状态（丢失前进状态）

                            // 后退则立即触发 hashchange，
                            // 并更新定时器记录的上个 hash 值
                            lastHash = c;
                        }
                        notifyHashChange();
                    }
                }
            };

            tearDown = function () {
                timer && clearTimeout(timer);
                timer = 0;
                Event.detach(iframe);
                DOM.remove(iframe);
                iframe = 0;
            };
        }

        special[HASH_CHANGE] = {
            setup:function () {
                if (this !== win) {
                    return;
                }
                // 第一次启动 hashchange 时取一下，不能类库载入后立即取
                // 防止类库嵌入后，手动修改过 hash，
                lastHash = getHash();
                // 不用注册 dom 事件
                setup();
            },
            tearDown:function () {
                if (this !== win) {
                    return;
                }
                tearDown();
            }
        };
    }
}, {
    requires:["./base", "dom", "ua", "./special"]
});

/**
 * 已知 bug :
 * - ie67 有时后退后取得的 location.hash 不和地址栏一致，导致必须后退两次才能触发 hashchange
 *
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 *//**
 * @fileOverview some keycodes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */
KISSY.add("event/keycodes", function() {
    var KeyCodes = {
        MAC_ENTER: 3,
        BACKSPACE: 8,
        TAB: 9,
        NUM_CENTER: 12,  // NUMLOCK on FF/Safari Mac
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESC: 27,
        SPACE: 32,
        PAGE_UP: 33,     // also NUM_NORTH_EAST
        PAGE_DOWN: 34,   // also NUM_SOUTH_EAST
        END: 35,         // also NUM_SOUTH_WEST
        HOME: 36,        // also NUM_NORTH_WEST
        LEFT: 37,        // also NUM_WEST
        UP: 38,          // also NUM_NORTH
        RIGHT: 39,       // also NUM_EAST
        DOWN: 40,        // also NUM_SOUTH
        PRINT_SCREEN: 44,
        INSERT: 45,      // also NUM_INSERT
        DELETE: 46,      // also NUM_DELETE
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        QUESTION_MARK: 63, // needs localization
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        META: 91, // WIN_KEY_LEFT
        WIN_KEY_RIGHT: 92,
        CONTEXT_MENU: 93,
        NUM_ZERO: 96,
        NUM_ONE: 97,
        NUM_TWO: 98,
        NUM_THREE: 99,
        NUM_FOUR: 100,
        NUM_FIVE: 101,
        NUM_SIX: 102,
        NUM_SEVEN: 103,
        NUM_EIGHT: 104,
        NUM_NINE: 105,
        NUM_MULTIPLY: 106,
        NUM_PLUS: 107,
        NUM_MINUS: 109,
        NUM_PERIOD: 110,
        NUM_DIVISION: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUMLOCK: 144,
        SEMICOLON: 186,            // needs localization
        DASH: 189,                 // needs localization
        EQUALS: 187,               // needs localization
        COMMA: 188,                // needs localization
        PERIOD: 190,               // needs localization
        SLASH: 191,                // needs localization
        APOSTROPHE: 192,           // needs localization
        SINGLE_QUOTE: 222,         // needs localization
        OPEN_SQUARE_BRACKET: 219,  // needs localization
        BACKSLASH: 220,            // needs localization
        CLOSE_SQUARE_BRACKET: 221, // needs localization
        WIN_KEY: 224,
        MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
        WIN_IME: 229
    };

    KeyCodes.isTextModifyingKeyEvent = function(e) {
        if (e.altKey && !e.ctrlKey ||
            e.metaKey ||
            // Function keys don't generate text
            e.keyCode >= KeyCodes.F1 &&
                e.keyCode <= KeyCodes.F12) {
            return false;
        }

        // The following keys are quite harmless, even in combination with
        // CTRL, ALT or SHIFT.
        switch (e.keyCode) {
            case KeyCodes.ALT:
            case KeyCodes.CAPS_LOCK:
            case KeyCodes.CONTEXT_MENU:
            case KeyCodes.CTRL:
            case KeyCodes.DOWN:
            case KeyCodes.END:
            case KeyCodes.ESC:
            case KeyCodes.HOME:
            case KeyCodes.INSERT:
            case KeyCodes.LEFT:
            case KeyCodes.MAC_FF_META:
            case KeyCodes.META:
            case KeyCodes.NUMLOCK:
            case KeyCodes.NUM_CENTER:
            case KeyCodes.PAGE_DOWN:
            case KeyCodes.PAGE_UP:
            case KeyCodes.PAUSE:
            case KeyCodes.PHANTOM:
            case KeyCodes.PRINT_SCREEN:
            case KeyCodes.RIGHT:
            case KeyCodes.SHIFT:
            case KeyCodes.UP:
            case KeyCodes.WIN_KEY:
            case KeyCodes.WIN_KEY_RIGHT:
                return false;
            default:
                return true;
        }
    };

    KeyCodes.isCharacterKey = function(keyCode) {
        if (keyCode >= KeyCodes.ZERO &&
            keyCode <= KeyCodes.NINE) {
            return true;
        }

        if (keyCode >= KeyCodes.NUM_ZERO &&
            keyCode <= KeyCodes.NUM_MULTIPLY) {
            return true;
        }

        if (keyCode >= KeyCodes.A &&
            keyCode <= KeyCodes.Z) {
            return true;
        }

        // Safari sends zero key code for non-latin characters.
        if (goog.userAgent.WEBKIT && keyCode == 0) {
            return true;
        }

        switch (keyCode) {
            case KeyCodes.SPACE:
            case KeyCodes.QUESTION_MARK:
            case KeyCodes.NUM_PLUS:
            case KeyCodes.NUM_MINUS:
            case KeyCodes.NUM_PERIOD:
            case KeyCodes.NUM_DIVISION:
            case KeyCodes.SEMICOLON:
            case KeyCodes.DASH:
            case KeyCodes.EQUALS:
            case KeyCodes.COMMA:
            case KeyCodes.PERIOD:
            case KeyCodes.SLASH:
            case KeyCodes.APOSTROPHE:
            case KeyCodes.SINGLE_QUOTE:
            case KeyCodes.OPEN_SQUARE_BRACKET:
            case KeyCodes.BACKSLASH:
            case KeyCodes.CLOSE_SQUARE_BRACKET:
                return true;
            default:
                return false;
        }
    };

    return KeyCodes;

});/**
 * @fileOverview   event-mouseenter
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/mouseenter', function (S, Event, DOM, UA, special) {
    S.each([
        { name:'mouseenter', fix:'mouseover' },
        { name:'mouseleave', fix:'mouseout' }
    ], function (o) {
        special[o.name] = {
            // fix #75
            onFix:o.fix,
            // all browser need
            delegateFix:o.fix,
            handle:function (event, handler, data) {
                var currentTarget = event.currentTarget,
                    relatedTarget = event.relatedTarget;
                // 在自身外边就触发
                // self === document,parent === null
                // relatedTarget 与 currentTarget 之间就是 mouseenter/leave
                if (!relatedTarget ||
                    (relatedTarget !== currentTarget &&
                        !DOM.contains(currentTarget, relatedTarget))) {
                    // http://msdn.microsoft.com/en-us/library/ms536945(v=vs.85).aspx
                    // does not bubble
                    event.stopPropagation();
                    return [handler.fn.call(handler.scope || currentTarget, event, data)];
                }
                return [];
            }
        };
    });

    return Event;
}, {
    requires:["./base", "dom", "ua", "./special"]
});

/**
 * yiminghe@gmail.com:2011-12-15
 * - 借鉴 jq 1.7 新的架构
 *
 * 承玉：2011-06-07
 * - 根据新结构，调整 mouseenter 兼容处理
 * - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 */
/**
 * @fileOverview normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add("event/mousewheel", function (S, Event, UA, Utils, EventObject, handle, _data, special) {

    var MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel',
        simpleRemove = Utils.simpleRemove,
        simpleAdd = Utils.simpleAdd,
        MOUSE_WHEEL_HANDLER = "mousewheelHandler";

    function handler(e) {
        var deltaX,
            currentTarget = this,
            deltaY,
            delta,
            detail = e.detail;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }
        if (e.detail) {
            // press control e.detail == 1 else e.detail == 3
            delta = -(detail % 3 == 0 ? detail / 3 : detail);
        }

        // Gecko
        if (e.axis !== undefined) {
            if (e.axis === e['HORIZONTAL_AXIS']) {
                deltaY = 0;
                deltaX = -1 * delta;
            } else if (e.axis === e['VERTICAL_AXIS']) {
                deltaX = 0;
                deltaY = delta;
            }
        }

        // Webkit
        if (e['wheelDeltaY'] !== undefined) {
            deltaY = e['wheelDeltaY'] / 120;
        }
        if (e['wheelDeltaX'] !== undefined) {
            deltaX = -1 * e['wheelDeltaX'] / 120;
        }

        // 默认 deltaY ( ie )
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        // can not invoke eventDesc.handler , it will protect type
        // but here in firefox , we want to change type really
        e = new EventObject(currentTarget, e);

        S.mix(e, {
            deltaY:deltaY,
            delta:delta,
            deltaX:deltaX,
            type:'mousewheel'
        });

        return  handle(currentTarget, e);
    }

    special['mousewheel'] = {
        setup:function () {
            var el = this,
                mousewheelHandler,
                eventDesc = _data._data(el);
            // solve this in ie
            mousewheelHandler = eventDesc[MOUSE_WHEEL_HANDLER] = S.bind(handler, el);
            simpleAdd(this, MOUSE_WHEEL, mousewheelHandler);
        },
        tearDown:function () {
            var el = this,
                mousewheelHandler,
                eventDesc = _data._data(el);
            mousewheelHandler = eventDesc[MOUSE_WHEEL_HANDLER];
            simpleRemove(this, MOUSE_WHEEL, mousewheelHandler);
            delete eventDesc[mousewheelHandler];
        }
    };

}, {
    requires:['./base', 'ua', './utils',
        './object', './handle',
        './data', "./special"]
});

/**
 note:
 not perfect in osx : accelerated scroll
 refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 **//**
 * @fileOverview   EventObject
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/object', function (S, undefined) {

    var doc = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        props = ('altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis').split(' ');

    /**
     * @class KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     * @name Object
     * @memberOf Event
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.originalEvent = domEvent || { };
        self.currentTarget = currentTarget;
        if (domEvent) { // html element
            self.type = domEvent.type;
            // incase dom event has been mark as default prevented by lower dom node
            self.isDefaultPrevented = ( domEvent['defaultPrevented'] || domEvent.returnValue === FALSE ||
                domEvent['getPreventDefault'] && domEvent['getPreventDefault']() ) ? TRUE : FALSE;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }
        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = TRUE;
    }

    S.augment(EventObject,
        /**
         * @lends Event.Object#
         */
        {

            /**
             * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
             * @type Boolean
             */
            isDefaultPrevented:FALSE,
            /**
             * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
             * @type Boolean
             */
            isPropagationStopped:FALSE,
            /**
             * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
             * @type Boolean
             */
            isImmediatePropagationStopped:FALSE,

            _fix:function () {
                var self = this,
                    originalEvent = self.originalEvent,
                    l = props.length, prop,
                    ct = self.currentTarget,
                    ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe

                // clone properties of the original event object
                while (l) {
                    prop = props[--l];
                    self[prop] = originalEvent[prop];
                }

                // fix target property, if necessary
                if (!self.target) {
                    self.target = self.srcElement || ownerDoc; // srcElement might not be defined either
                }

                // check if target is a textnode (safari)
                if (self.target.nodeType === 3) {
                    self.target = self.target.parentNode;
                }

                // add relatedTarget, if necessary
                if (!self.relatedTarget && self.fromElement) {
                    self.relatedTarget = (self.fromElement === self.target) ? self.toElement : self.fromElement;
                }

                // calculate pageX/Y if missing and clientX/Y available
                if (self.pageX === undefined && self.clientX !== undefined) {
                    var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
                    self.pageX = self.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
                    self.pageY = self.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
                }

                // add which for key events
                if (self.which === undefined) {
                    self.which = (self.charCode === undefined) ? self.keyCode : self.charCode;
                }

                // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
                if (self.metaKey === undefined) {
                    self.metaKey = self.ctrlKey;
                }

                // add which for click: 1 === left; 2 === middle; 3 === right
                // Note: button is not normalized, so don't use it
                if (!self.which && self.button !== undefined) {
                    self.which = (self.button & 1 ? 1 : (self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0)));
                }
            },

            /**
             * Prevents the event's default behavior
             */
            preventDefault:function () {
                var e = this.originalEvent;

                // if preventDefault exists run it on the original event
                if (e.preventDefault) {
                    e.preventDefault();
                }
                // otherwise set the returnValue property of the original event to FALSE (IE)
                else {
                    e.returnValue = FALSE;
                }

                this.isDefaultPrevented = TRUE;
            },

            /**
             * Stops the propagation to the next bubble target
             */
            stopPropagation:function () {
                var e = this.originalEvent;

                // if stopPropagation exists run it on the original event
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                // otherwise set the cancelBubble property of the original event to TRUE (IE)
                else {
                    e.cancelBubble = TRUE;
                }

                this.isPropagationStopped = TRUE;
            },


            /**
             * Stops the propagation to the next bubble target and
             * prevents any additional listeners from being exectued
             * on the current target.
             */
            stopImmediatePropagation:function () {
                var self = this;
                self.isImmediatePropagationStopped = TRUE;
                // fixed 1.2
                // call stopPropagation implicitly
                self.stopPropagation();
            },

            /**
             * Stops the event propagation and prevents the default
             * event behavior.
             * @param  {boolean} [immediate] if true additional listeners on the current target will not be executed
             */
            halt:function (immediate) {
                var self = this;
                if (immediate) {
                    self.stopImmediatePropagation();
                } else {
                    self.stopPropagation();
                }
                self.preventDefault();
            }
        });

    return EventObject;

});

/**
 * NOTES:
 *
 *  2010.04
 *   - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
 *
 * TODO:
 *   - pageX, clientX, scrollLeft, clientLeft 的详细测试
 */
/**
 * @fileOverview responsible for un-registering event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/remove", function (S, Event, DOM, Utils, _data, EVENT_SPECIAL) {
    var isValidTarget = Utils.isValidTarget,
        simpleRemove = Utils.simpleRemove;

    S.mix(Event,
        /**
         * @lends Event
         */
        {
            // single target, single type, fixed native
            __remove:function (isNativeTarget, target, type, fn, scope) {

                if (!target || (isNativeTarget && !isValidTarget(target))) {
                    return;
                }

                var typedGroups = Utils.getTypedGroups(type);
                type = typedGroups[0];
                var groups = typedGroups[1],
                    selector,
                    // in case type is undefined
                    originalFn = fn,
                    originalScope = scope,
                    hasSelector, s = EVENT_SPECIAL[type];

                if (S.isObject(fn)) {
                    scope = fn.scope;
                    hasSelector = ("selector" in fn);
                    selector = fn.selector;
                    fn = fn.fn;
                    if (selector) {
                        if (s && s['delegateFix']) {
                            type = s['delegateFix'];
                        }
                    }
                }

                if (!selector) {
                    if (s && s['onFix']) {
                        type = s['onFix'];
                    }
                }

                var eventDesc = _data._data(target),
                    events = eventDesc && eventDesc.events,
                    handlers,
                    handler,
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
                        if (events.hasOwnProperty(type)) {
                            Event.__remove(isNativeTarget,
                                target, type + groups, originalFn,
                                originalScope);
                        }
                    }
                    return;
                }

                var groupsRe;

                if (groups) {
                    groupsRe = Utils.getGroupsRe(groups);
                }

                if ((handlers = events[type])) {
                    len = handlers.length;
                    // 移除 fn
                    if ((fn || hasSelector || groupsRe ) && len) {
                        scope = scope || target;

                        for (i = 0, j = 0, t = []; i < len; ++i) {
                            handler = handlers[i];
                            var handlerScope = handler.scope || target;
                            if (
                                (scope != handlerScope) ||
                                    // 指定了函数，函数不相等，保留
                                    (fn && fn != handler.fn) ||
                                    // 1.没指定函数
                                    // 1.1 没有指定选择器,删掉 else2
                                    // 1.2 指定选择器,字符串为空
                                    // 1.2.1 指定选择器,字符串为空,待比较 handler 有选择器,删掉 else
                                    // 1.2.2 指定选择器,字符串为空,待比较 handler 没有选择器,保留
                                    // 1.3 指定选择器,字符串不为空,字符串相等,删掉 else
                                    // 1.4 指定选择器,字符串不为空,字符串不相等,保留
                                    // 2.指定了函数且函数相等
                                    // 2.1 没有指定选择器,删掉 else
                                    // 2.2 指定选择器,字符串为空
                                    // 2.2.1 指定选择器,字符串为空,待比较 handler 有选择器,删掉 else
                                    // 2.2.2 指定选择器,字符串为空,待比较 handler 没有选择器,保留
                                    // 2.3 指定选择器,字符串不为空,字符串相等,删掉  else
                                    // 2.4 指定选择器,字符串不为空,字符串不相等,保留
                                    (
                                        hasSelector &&
                                            (
                                                (selector && selector != handler.selector) ||
                                                    (!selector && !handler.selector)
                                                )
                                        ) ||

                                    // 指定了删除的某些组，而该 handler 不属于这些组，保留，否则删除
                                    (groupsRe && !handler.groups.match(groupsRe))

                                ) {
                                t[j++] = handler;
                            }
                            else {
                                if (handler.selector && handlers.delegateCount) {
                                    handlers.delegateCount--;
                                }
                                if (handler.last && handlers.lastCount) {
                                    handlers.lastCount--;
                                }
                                if (special.remove) {
                                    special.remove.call(target, handler);
                                }
                            }
                        }
                        t.delegateCount = handlers.delegateCount;
                        t.lastCount = handlers.lastCount;
                        events[type] = t;
                        len = t.length;
                    } else {
                        // 全部删除
                        len = 0;
                    }

                    if (!len) {
                        // remove(el, type) or fn 已移除光
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
             * @param {String} [type] The type of event to remove.
             * use space to separate multiple event types.
             * @param {Function} [fn] The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            remove:function (targets, type, fn, scope) {

                type = S.trim(type);

                if (Utils.batchForType(Event.remove, targets, type, fn, scope)) {
                    return targets;
                }

                targets = DOM.query(targets);

                for (var i = targets.length - 1; i >= 0; i--) {
                    Event.__remove(true, targets[i], type, fn, scope);
                }

                return targets;

            }
        });
}, {
    requires:['./base', 'dom', './utils', './data', './special']
});/**
 * @fileOverview special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add("event/special", function () {
    return {};
});/**
 * @fileOverview patch for ie<9 submit : does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add("event/submit", function (S, UA, Event, DOM, special) {
    var mode = S.Env.host.document['documentMode'];
    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {
        var nodeName = DOM._nodeName;
        special['submit'] = {
            setup:function () {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                // lazy add submit for inside forms
                // note event order : click/keypress -> submit
                // keypoint : find the forms
                Event.on(el, "click keypress", detector);
            },
            tearDown:function () {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                Event.remove(el, "click keypress", detector);
                S.each(DOM.query("form", el),function (form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, "submit", {
                            fn:submitBubble,
                            last:1
                        });
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                form = nodeName(t, "input") || nodeName(t, "button") ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, "submit", {
                    fn:submitBubble,
                    last:1
                });
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode &&
                // it is stopped by user callback
                !e.isPropagationStopped &&
                // it is not fired manually
                !e._ks_fired) {
                // simulated bubble for submit
                // fire from parentNode. if form.on("submit") , this logic is never run!
                Event.fire(form.parentNode, "submit", e);
            }
        }
    }

}, {
    requires:["ua", "./base", "dom", "./special"]
});
/**
 * modified from jq ,fix submit in ie<9
 *  - http://bugs.jquery.com/ticket/11049
 **//**
 * @fileOverview 提供事件发布和订阅机制
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/target', function (S, Event, EventObject, Utils, handle, undefined) {
    var KS_PUBLISH = "__~ks_publish",
        trim = S.trim,
        splitAndRun = Utils.splitAndRun,
        KS_BUBBLE_TARGETS = "__~ks_bubble_targets",
        ALL_EVENT = "*";

    function getCustomEvent(self, type, eventData) {
        if (eventData instanceof EventObject) {
            // set currentTarget in the process of bubbling
            eventData.currentTarget = self;
            return eventData;
        }
        var customEvent = new EventObject(self, undefined, type);
        S.mix(customEvent, eventData);
        return customEvent
    }

    function getEventPublishObj(self) {
        self[KS_PUBLISH] = self[KS_PUBLISH] || {};
        return self[KS_PUBLISH];
    }

    function getBubbleTargetsObj(self) {
        self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || {};
        return self[KS_BUBBLE_TARGETS];
    }

    function isBubblable(self, eventType) {
        var publish = getEventPublishObj(self);
        return publish[eventType] && publish[eventType].bubbles || publish[ALL_EVENT] && publish[ALL_EVENT].bubbles
    }

    function attach(method) {
        return function (type, fn, scope) {
            var self = this;
            type = trim(type);
            splitAndRun(type, function (t) {
                Event["__" + method](false, self, t, fn, scope);
            });
            return self; // chain
        };
    }

    /**
     * @class EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
     * and also allows other EventTargets to target the object with events sourced from the other object.
     * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
     * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
     * or will not be created at all.
     * @namespace
     * @name Target
     * @memberOf Event
     */
    var Target =
    /**
     * @lends Event.Target
     */
    {
        /**
         * Fire a custom event by name.
         * The callback functions will be executed from the context specified when the event was created,
         * and the {@link Event.Object} created will be mixed with eventData
         * @param {String} type The type of the event
         * @param {Object} [eventData] The data will be mixed with {@link Event.Object} created
         * @returns {Boolean|*} If any listen returns false, then the returned value is false. else return the last listener's returned value
         */
        fire:function (type, eventData) {
            var self = this,
                ret = undefined,
                r2,
                customEvent;
            eventData = eventData || {};
            type = trim(type);
            if (type.indexOf(" ") > 0) {
                splitAndRun(type, function (t) {
                    r2 = self.fire(t, eventData);
                    if (ret !== false) {
                        ret = r2;
                    }
                });
                return ret;
            }
            var typedGroups = Utils.getTypedGroups(type), _ks_groups = typedGroups[1];
            type = typedGroups[0];
            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }
            S.mix(eventData, {
                // protect type
                type:type,
                _ks_groups:_ks_groups
            });
            customEvent = getCustomEvent(self, type, eventData);
            ret = handle(self, customEvent);
            if (!customEvent.isPropagationStopped &&
                isBubblable(self, type)) {
                r2 = self.bubble(type, customEvent);
                // false 优先返回
                if (ret !== false) {
                    ret = r2;
                }
            }
            return ret
        },

        /**
         * Creates a new custom event of the specified type
         * @param {String} type The type of the event
         * @param {Object} cfg Config params
         * @param {Boolean} [cfg.bubbles=false] whether or not this event bubbles
         */
        publish:function (type, cfg) {
            var self = this,
                publish = getEventPublishObj(self);
            type = trim(type);
            if (type) {
                publish[type] = cfg;
            }
        },

        /**
         * bubble event to its targets
         * @param type
         * @param eventData
         * @private
         */
        bubble:function (type, eventData) {
            var self = this,
                ret = undefined,
                targets = getBubbleTargetsObj(self);
            S.each(targets, function (t) {
                var r2 = t.fire(type, eventData);
                if (ret !== false) {
                    ret = r2;
                }
            });
            return ret;
        },

        /**
         * Registers another EventTarget as a bubble target.
         * @param {Event.Target} target Another EventTarget instance to add
         */
        addTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            targets[S.stamp(target)] = target;
        },

        /**
         * Removes a bubble target
         * @param {Event.Target} target Another EventTarget instance to remove
         */
        removeTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            delete targets[S.stamp(target)];
        },

        /**
         * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
         * @function
         * @param {String} type The name of the event
         * @param {Function} fn The callback to execute in response to the event
         * @param {Object} [scope] this object in callback
         */
        on:attach("add"),
        /**
         * Detach one or more listeners the from the specified event
         * @function
         * @param {String} type The name of the event
         * @param {Function} [fn] The subscribed function to unsubscribe. if not supplied, all subscribers will be removed.
         * @param {Object} [scope] The custom object passed to subscribe.
         */
        detach:attach("remove")
    };

    return Target;
}, {
    requires:["./base", './object', './utils', './handle']
});
/**
 *  yiminghe:2011-10-17
 *   - implement bubble for custom event
 **//**
 * @fileOverview utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/utils", function (S, DOM) {

    /**
     * whether two event listens are the same
     * @param h1 已有的 handler 描述
     * @param h2 用户提供的 handler 描述
     */
    function isIdenticalHandler(h1, h2, el) {
        var scope1 = h1.scope || el,
            ret = 1,
            scope2 = h2.scope || el;
        if (
            h1.fn !== h2.fn ||
                h1.selector !== h2.selector ||
                h1.data !== h2.data ||
                scope1 !== scope2 ||
                h1.originalType !== h2.originalType ||
                h1.groups !== h2.groups ||
                h1.last !== h2.last
            ) {
            ret = 0;
        }
        return ret;
    }


    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target &&
            target.nodeType !== DOM.TEXT_NODE &&
            target.nodeType !== DOM.COMMENT_NODE;
    }


    function batchForType(fn, targets, types) {
        // on(target, 'click focus', fn)
        if (types && types.indexOf(" ") > 0) {
            var args = S.makeArray(arguments);
            S.each(types.split(/\s+/), function (type) {
                var args2 = [].concat(args);
                args2.splice(0, 3, targets, type);
                fn.apply(null, args2);
            });
            return true;
        }
        return 0;
    }


    function splitAndRun(type, fn) {
        S.each(type.split(/\s+/), fn);
    }

    var doc = S.Env.host.document,
        simpleAdd = doc.addEventListener ?
            function (el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function (el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function (el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function (el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            };


    return {
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器通知的系统 eventHandler 中检查
        // 如果相同，那么证明已经 fire 过了，不要再次触发了
        Event_Triggered:"",
        TRIGGERED_NONE:"trigger-none-" + S.now(),
        EVENT_GUID:'ksEventTargetId' + S.now(),
        splitAndRun:splitAndRun,
        batchForType:batchForType,
        isValidTarget:isValidTarget,
        isIdenticalHandler:isIdenticalHandler,
        simpleAdd:simpleAdd,
        simpleRemove:simpleRemove,
        getTypedGroups:function (type) {
            if (type.indexOf(".") < 0) {
                return [type, ""];
            }
            var m = type.match(/([^.]+)?(\..+)?$/),
                t = m[1],
                ret = [t],
                gs = m[2];
            if (gs) {
                gs = gs.split(".").sort();
                ret.push(gs.join("."));
            } else {
                ret.push("");
            }
            return ret;
        },
        getGroupsRe:function (groups) {
            return new RegExp(groups.split(".").join(".*\\.") + "(?:\\.|$)");
        }
    };

}, {
    requires:['dom']
});/**
 * @fileOverview  inspired by yui3 :
 *
 * Synthetic event that fires when the <code>value</code> property of an input
 * field or textarea changes as a result of a keystroke, mouse operation, or
 * input method editor (IME) input event.
 *
 * Unlike the <code>onchange</code> event, this event fires when the value
 * actually changes and not when the element loses focus. This event also
 * reports IME and multi-stroke input more reliably than <code>oninput</code> or
 * the various key events across browsers.
 *
 * @author yiminghe@gmail.com
 */
KISSY.add('event/valuechange', function (S, Event, DOM, special) {
    var VALUE_CHANGE = "valuechange",
        nodeName = DOM._nodeName,
        KEY = "event/valuechange",
        HISTORY_KEY = KEY + "/history",
        POLL_KEY = KEY + "/poll",
        interval = 50;

    function clearPollTimer(target) {
        if (DOM.hasData(target, POLL_KEY)) {
            var poll = DOM.data(target, POLL_KEY);
            clearTimeout(poll);
            DOM.removeData(target, POLL_KEY);
        }
    }

    function stopPoll(target) {
        DOM.removeData(target, HISTORY_KEY);
        clearPollTimer(target);
    }

    function stopPollHandler(ev) {
        clearPollTimer(ev.target);
    }

    function checkChange(target) {
        var v = target.value,
            h = DOM.data(target, HISTORY_KEY);
        if (v !== h) {
            // 只触发自己绑定的 handler
            Event.fire(target, VALUE_CHANGE, {
                prevVal:h,
                newVal:v
            }, true);
            DOM.data(target, HISTORY_KEY, v);
        }
    }

    function startPoll(target) {
        if (DOM.hasData(target, POLL_KEY)) {
            return;
        }
        DOM.data(target, POLL_KEY, setTimeout(function () {
            checkChange(target);
            DOM.data(target, POLL_KEY, setTimeout(arguments.callee, interval));
        }, interval));
    }

    function startPollHandler(ev) {
        var target = ev.target;
        // when focus ,record its current value immediately
        if (ev.type == "focus") {
            DOM.data(target, HISTORY_KEY, target.value);
        }
        startPoll(target);
    }

    function webkitSpeechChangeHandler(e) {
        checkChange(e.target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, "blur", stopPollHandler);
        // fix #94
        // see note 2012-02-08
        Event.on(target, "webkitspeechchange", webkitSpeechChangeHandler);
        Event.on(target, "mousedown keyup keydown focus", startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, "blur", stopPollHandler);
        Event.remove(target, "webkitspeechchange", webkitSpeechChangeHandler);
        Event.remove(target, "mousedown keyup keydown focus", startPollHandler);
    }

    special[VALUE_CHANGE] = {
        setup:function () {
            var target = this;
            if (nodeName(target, "input")
                || nodeName(target, "textarea")) {
                monitor(target);
            }
        },
        tearDown:function () {
            var target = this;
            unmonitored(target);
        }
    };
    return Event;
}, {
    requires:["./base", "dom", "./special"]
});

/**
 * 2012-02-08 yiminghe@gmail.com note about webkitspeechchange :
 *  当 input 没焦点立即点击语音
 *   -> mousedown -> blur -> focus -> blur -> webkitspeechchange -> focus
 *  第二次：
 *   -> mousedown -> blur -> webkitspeechchange -> focus
 **/
