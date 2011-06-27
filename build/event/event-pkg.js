/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  event
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/base', function(S, DOM, EventObject, undefined) {

    var doc = document,
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
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器�?知的系统 eventHandler 中检�?
        // 如果相同，那么证明已�?fire 过了，不要再次触发了
        Event_Triggered = "",
        TRIGGERED_NONE = "trigger-none-" + S.now(),
        // 事件存储位置 key
        // { handler: eventHandler, events:  {type:[{scope:scope,fn:fn}]}  } }
        EVENT_GUID = 'ksEventTargetId' + S.now();

    var Event = {
        _data:function(elem) {
            var args = S.makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },
        _removeData:function(elem) {
            var args = S.makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        },

        // such as: { 'mouseenter' : { setup:fn ,tearDown:fn} }
        special: { },

        /**
         * Adds an event listener.
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
            // data : 附加在回调后面的数据，delegate �?��使用
            // remove �?data 相等(指向同一对象或�?定义�?equals 比较函数)
        add: function(targets, type, fn, scope /* optional */, data/*internal usage*/) {
            if (batchForType('add', targets, type, fn, scope, data)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                var isNativeEventTarget = !target.isCustomEventTarget,
                    eventDesc;

                // 不是有效�?target �?参数不对
                if (!target ||
                    !type ||
                    !S.isFunction(fn) ||
                    (isNativeEventTarget && !isValidTarget(target))) {
                    return;
                }
                // 获取事件描述
                eventDesc = Event._data(target);
                if (!eventDesc) {
                    Event._data(target, eventDesc = {});
                }
                //事件 listeners
                var events = eventDesc.events = eventDesc.events || {},
                    handlers = events[type] = events[type] || [],
                    handleObj = {fn: fn, scope: scope || target,data:data},
                    eventHandler = eventDesc.handler;
                // 该元素没�?handler ，并且该元素�?dom 节点时才�?��注册 dom 事件
                if (!eventHandler) {
                    eventHandler = eventDesc.handler = function(event, data) {
                        // 是经�?fire 手动调用而导致的，就不要再次触发了，已经�?fire �?bubble 过一次了
                        if (event && event.type == Event_Triggered) {
                            return;
                        }
                        var target = eventHandler.target;
                        if (!event || !event.fixed) {
                            event = new EventObject(target, event);
                        }
                        if (S.isPlainObject(data)) {
                            S.mix(event, data);
                        }
                        return Event._handle(target, event);
                    };
                    eventHandler.target = target;
                }
                if (isNativeEventTarget) {
                    addDomEvent(target, type, eventHandler, handlers, handleObj);
                    //nullify to prevent memory leak in ie ?
                    target = null;
                }
                // 增加 listener
                handlers.push(handleObj);
            });
            return targets;
        },

        __getListeners:function(target, type) {
            var events = Event.__getEvents(target) || {};
            return events[type] || [];
        },

        __getEvents:function(target) {
            // 获取事件描述
            var eventDesc = Event._data(target);
            return eventDesc && eventDesc.events;
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(targets, type /* optional */, fn /* optional */, scope /* optional */, data/*internal usage*/) {
            if (batchForType('remove', targets, type, fn, scope)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                var eventDesc = Event._data(target),
                    events = eventDesc && eventDesc.events,
                    listeners,
                    len,
                    i,
                    j,
                    t,
                    isNativeEventTarget = !target.isCustomEventTarget,
                    special = (isNativeEventTarget && Event.special[type]) || { };
                if (!target ||
                    (!isNativeEventTarget && !isValidTarget(target)) ||
                    !events) {
                    return;
                }
                // remove all types of event
                if (type === undefined) {
                    for (type in events) {
                        Event.remove(target, type);
                    }
                    return;
                }

                scope = scope || target;

                if ((listeners = events[type])) {
                    len = listeners.length;
                    // 移除 fn
                    if (S.isFunction(fn) && len) {
                        for (i = 0,j = 0,t = []; i < len; ++i) {
                            var reserve = false,listener = listeners[i];
                            if (fn !== listener.fn
                                || scope !== listener.scope) {
                                t[j++] = listener;
                                reserve = true;
                            } else if (data !== data2) {
                                var data2 = listener.data;
                                // undelgate 不能 remove 普�? on �?handler
                                // remove 不能 remove delegate �?handler
                                if (!data && data2
                                    || data2 && !data
                                    ) {
                                    t[j++] = listener;
                                    reserve = true;
                                } else if (data && data2) {
                                    if (!data.equals || !data2.equals) {
                                        S.error("no equals in data");
                                    } else if (!data2.equals(data)) {
                                        t[j++] = listener;
                                        reserve = true;
                                    }
                                }
                            }
                            if (!reserve && special.remove) {
                                special.remove.call(target, listener);
                            }
                        }
                        events[type] = t;
                        len = t.length;
                    }

                    // remove(el, type) or fn 已移除光
                    if (fn === undefined || len === 0) {
                        // dom node need to detach handler from dom node
                        if (isNativeEventTarget &&
                            (!special['tearDown'] ||
                                special['tearDown'].call(target) === false)) {
                            simpleRemove(target, type, eventDesc.handler);
                        }
                        delete events[type];
                    }
                }

                // remove expando
                if (S.isEmptyObject(events)) {
                    eventDesc.handler.target = null;
                    delete eventDesc.handler;
                    delete eventDesc.events;
                    Event._removeData(target);
                }
            });
            return targets;
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
                ret = listener.fn.call(listener.scope, event, listener.data);
                // �?jQuery 逻辑保持�?��

                if (ret !== undefined) {

                    // 有一�?false，最终结果就�?false
                    // 否则等于�?���?��返回�?
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

            return gRet;
        },

        /**
         * fire event , simulate bubble in browser
         */
        fire:function(targets, eventType, eventData) {
            if (batchForType("fire", targets, eventType, eventData)) {
                return;
            }

            var ret;

            DOM.query(targets).each(function(target) {
                var isNativeEventTarget = !target.isCustomEventTarget;
                // 自定义事件很�?��，不�?��冒泡，不�?��默认事件处理
                eventData = eventData || {};
                eventData.type = eventType;
                if (!isNativeEventTarget) {
                    var eventDesc = Event._data(target);
                    if (eventDesc && S.isFunction(eventDesc.handler)) {
                        ret = eventDesc.handler(undefined, eventData);
                    }
                } else {
                    var r = fireDOMEvent(target, eventType, eventData);
                    if (r !== undefined) {
                        ret = r;
                    }
                }
            });
            return ret;
        },
        _batchForType:batchForType,
        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;
    Event.detach = Event.remove;

    function batchForType(methodName, targets, types) {
        // on(target, 'click focus', fn)
        if ((types = S.trim(types)) && types.indexOf(SPACE) > 0) {
            var args = S.makeArray(arguments);
            S.each(types.split(SPACE), function(type) {
                var args2 = S.clone(args);
                args2.splice(0, 3, targets, type);
                Event[methodName].apply(Event, args2);
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

    /**
     * dom node need eventHandler attached to dom node
     */
    function addDomEvent(target, type, eventHandler, handlers, handleObj) {
        var special = Event.special[type] || {};
        // dom 节点才需要注�?dom 事件
        if (!handlers.length && (!special.setup || special.setup.call(target) === false)) {
            simpleAdd(target, type, eventHandler)
        }
        if (special.add) {
            special.add.call(target, handleObj);
        }
    }


    /**
     * fire dom event from bottom to up
     */
    function fireDOMEvent(target, eventType, eventData) {
        var ret;
        if (!isValidTarget(target)) {
            return ret;
        }
        var event = new EventObject(target, eventData);
        event.target = target;
        var cur = target,
            ontype = "on" + eventType;
        //bubble up dom tree
        do{
            var handler = (Event._data(cur) || {}).handler;
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
            cur = cur.parentNode ||
                cur.ownerDocument ||
                cur === target.ownerDocument && window;
        } while (cur && !event.isPropagationStopped);

        if (!event.isDefaultPrevented) {
            if (!(eventType === "click" && target.nodeName.toLowerCase() == "a")) {
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
                }

                if (old) {
                    target[ ontype ] = old;
                }

                Event_Triggered = TRIGGERED_NONE;
            }
        }
        return ret;
    }

    if (1 > 2) {
        Event._simpleAdd()._simpleRemove();
    }

    return Event;
}, {
        requires:["dom","event/object"]
    });

/**
 * 承玉�?011-06-07
 *  - eventHandler �?��元素�?��而不是一个元素一个事件一个，节省内存
 *  - 减少闭包使用，prevent ie 内存泄露�?
 *  - 增加 fire ，模拟冒泡处�?dom 事件
 *  - TODO: 自定义事件和 dom 事件操作分离?
 *
 * TODO:
 *   - event || window.event, �?��情况下取 window.event ? IE4 ?
 *   - 更详尽细致的 test cases
 *   - 内存泄漏测试
 *   - target �?window, iframe 等特殊对象时�?test case
 */
/**
 * kissy delegate for event module
 * @author:yiminghe@gmail.com
 */
KISSY.add("event/delegate", function(S, DOM, Event) {
    var batchForType = Event._batchForType,
        delegateMap = {
            focus:"focusin",
            blur:"focusout"
        };

    S.mix(Event, {
            delegate:function(targets, type, selector, fn, scope) {
                if (batchForType('delegate', targets, type, selector, fn, scope)) {
                    return targets;
                }
                DOM.query(targets).each(function(target) {
                    // 自定义事�?delegate 无意�?
                    if (target.isCustomEventTarget) {
                        return;
                    }
                    type = delegateMap[type] || type;
                    Event.on(target, type, delegateHandler, target, {
                            fn:fn,
                            selector:selector,
                            // type:type,
                            scope:scope,
                            equals:equals
                        });
                });
                return targets;
            },

            undelegate:function(targets, type, selector, fn, scope) {
                if (batchForType('undelegate', targets, type, selector, fn, scope)) {
                    return targets;
                }
                DOM.query(targets).each(function(target) {
                    // 自定义事�?delegate 无意�?
                    if (target.isCustomEventTarget) {
                        return;
                    }
                    type = delegateMap[type] || type;
                    Event.remove(target, type, delegateHandler, target, {
                            fn:fn,
                            selector:selector,
                            // type:type,
                            scope:scope,
                            equals:equals
                        });
                });
            }
        });

    // 比较函数，两�?delegate 描述对象比较
    function equals(d) {
        if (d.fn === undefined && d.selector === undefined) {
            return true;
        } else if (d.fn === undefined) {
            return this.selector == d.selector;
        } else {
            return this.fn == d.fn && this.selector == d.selector && this.scope == d.scope;
        }
    }

    function eq(d1, d2) {
        return (d1 == d2 || (!d1 && d2) || (!d1 && d2));
    }

    // 根据 selector ，从事件源得到对应节�?
    function delegateHandler(event, data) {
        var delegateTarget = this,
            gret,
            target = event.target,
            invokeds = DOM.closest(target, [data.selector], delegateTarget);
        // 找到了符�?selector 的元素，可能并不是事件源
        if (invokeds) {
            for (var i = 0; i < invokeds.length; i++) {
                event.currentTarget = invokeds[i];
                var ret = data.fn.call(data.scope || delegateTarget, event);
                if (ret === false ||
                    event.isPropagationStopped ||
                    event.isImmediatePropagationStopped) {
                    if (ret === false) {
                        gret = ret;
                    }
                    if (event.isPropagationStopped ||
                        event.isImmediatePropagationStopped) {
                        break;
                    }
                }
            }
        }
        return gret;
    }

    return Event;
}, {
        requires:["dom","./base"]
    });

/**
 * focusin/out 的特殊之�?, delegate 只能在容器上注册 focusin/out �?
 * 1.其实�?ie 都是注册 focus capture=true，然后注册到 focusin 对应 handlers
 *   1.1 �?Event.fire("focus")，没�?focus 对应�?handlers 数组，然后调用元�?focus 方法�?
 *   focusin.js 调用 Event.fire("focusin") 进�?执行 focusin 对应�?handlers 数组
 *   1.2 当调�?Event.fire("focusin")，直接执�?focusin 对应�?handlers 数组，但不会真正聚焦
 *
 * 2.ie 直接注册 focusin , focusin handlers 也有对应用户回调
 *   2.1 �?Event.fire("focus") , �?1.1
 *   2.2 �?Event.fire("focusin"),直接执行 focusin 对应�?handlers 数组，但不会真正聚焦
 *
 * TODO:
 * mouseenter/leave delegate??
 *
 **//**
 * @module  event-focusin
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/focusin', function(S, UA, Event) {

    // 让非 IE 浏览器支�?focusin/focusout
    if (!UA.ie) {
        S.each([
            { name: 'focusin', fix: 'focus' },
            { name: 'focusout', fix: 'blur' }
        ], function(o) {
            var attaches = 0;
            Event.special[o.name] = {
                setup: function() {
                    if (attaches++ === 0) {
                        document.addEventListener(o.fix, handler, true);
                    }
                },

                tearDown:function() {
                    if (--attaches === 0) {
                        document.removeEventListener(o.fix, handler, true);
                    }
                }
            };

            function handler(event) {
                var target = event.target;
                return Event.fire(target, o.name);
            }

        });
    }
    return Event;
}, {
        requires:["ua","./base"]
    });

/**
 * 承玉:2011-06-07
 * - refactor to jquery , 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 *
 * NOTES:
 *  - webkit �?opera 已支�?DOMFocusIn/DOMFocusOut 事件，但上面的写法已经能达到预期效果，暂时不考虑原生支持�?
 */
/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com, xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function(S, Event, DOM, UA) {

    var doc = document,
        HASH_CHANGE = 'hashchange',
        docMode = doc['documentMode'],
        ie = docMode || UA['ie'];


    // IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
    if ((!( 'on' + HASH_CHANGE in window)) || ie < 8) {
        var timer,
            targets = [],
            lastHash = getHash();

        Event.special[HASH_CHANGE] = {
            setup: function() {
                var target = this,
                    index = S.indexOf(target, targets);
                if (-1 === index) {
                    targets.push(target);
                }
                if (!timer) {
                    setup();
                }
                //不用注册dom事件
            },
            tearDown: function() {
                var target = this,
                    index = S.indexOf(target, targets);
                if (index >= 0) {
                    targets.splice(index, 1);
                }
                if (targets.length === 0) {
                    tearDown();
                }
            }
        };

        function setup() {
            poll();
        }

        function tearDown() {
            timer && clearTimeout(timer);
            timer = null;
        }

        function poll() {
            //console.log('poll start..' + +new Date());
            var hash = getHash();

            if (hash !== lastHash) {
                //debugger
                hashChange(hash);
                lastHash = hash;
            }
            timer = setTimeout(poll, 50);
        }

        function hashChange(hash) {
            notifyHashChange(hash);
        }

        function notifyHashChange(hash) {
            S.log("hash changed : " + hash);
            for (var i = 0; i < targets.length; i++) {
                var t = targets[i];
                //模拟暂时没有属�?
                Event._handle(t, {
                        type: HASH_CHANGE
                    });
            }
        }


        function getHash() {
            var url = location.href;
            return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
        }

        // ie6, 7, 用匿名函数来覆盖�?��function
        if (ie < 8) {
            (function() {
                var iframe;

                /**
                 * 前进后�? : start -> notifyHashChange
                 * 直接输入 : poll -> hashChange -> start
                 * iframe 内容�?url 同步
                 */

                setup = function() {
                    if (!iframe) {
                        //http://www.paciellogroup.com/blog/?p=604
                        iframe = DOM.create('<iframe ' +
                            //'src="#" ' +
                            'style="display: none" ' +
                            'height="0" ' +
                            'width="0" ' +
                            'tabindex="-1" ' +
                            'title="empty"/>');
                        // Append the iframe to the documentElement rather than the body.
                        // Keeping it outside the body prevents scrolling on the initial
                        // page load
                        DOM.prepend(iframe, document.documentElement);

                        // init
                        Event.add(iframe, "load", function() {
                            Event.remove(iframe, "load");
                            // Update the iframe with the initial location hash, if any. This
                            // will create an initial history entry that the user can return to
                            // after the state has changed.
                            hashChange(getHash());
                            Event.add(iframe, "load", start);
                            poll();
                        });

                        /**
                         * 前进后�? �?start -> 触发
                         * 直接输入 : timer -> hashChange -> start -> 触发
                         * 触发统一�?start(load)
                         * iframe 内容�?url 同步
                         */
                            //后�?触发�?
                            //或addHistory 调用
                            //只有 start 来�?知应用程�?
                        function start() {
                            //console.log('iframe start load..');
                            //debugger
                            var c = S.trim(iframe.contentWindow.document.body.innerHTML);
                            var ch = getHash();

                            //后�?时不�?
                            //改变location则相�?
                            if (c != ch) {
                                location.hash = c;
                                // 使lasthash为iframe历史�?不然重新写iframe�?会导致最新状态（丢失前进状�?�?
                                lastHash = c;
                            }
                            notifyHashChange(c);
                        }
                    }
                };

                hashChange = function(hash) {
                    //debugger
                    var html = '<html><body>' + hash + '</body></html>';
                    var doc = iframe.contentWindow.document;
                    try {
                        // 写入历史 hash
                        doc.open();
                        doc.write(html);
                        doc.close();
                        return true;
                    } catch (e) {
                        return false;
                    }
                };
            })();
        }
    }
}, {
        requires:["./base","dom","ua"]
    });

/**
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 *//**
 * @module  event-mouseenter
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/mouseenter', function(S, Event, DOM, UA) {

    if (!UA['ie']) {
        S.each([
            { name: 'mouseenter', fix: 'mouseover' },
            { name: 'mouseleave', fix: 'mouseout' }
        ], function(o) {


            // 元素内触发的 mouseover/out 不能�?mouseenter/leave
            function withinElement(event) {

                var self = this,
                    parent = event.relatedTarget;

                // 设置用户实际注册的事件名，触发该事件�?��应的 listener 数组
                event.type = o.name;

                // Firefox sometimes assigns relatedTarget a XUL element
                // which we cannot access the parentNode property of
                try {

                    // Chrome does something similar, the parentNode property
                    // can be accessed but is null.
                    if (parent && parent !== document && !parent.parentNode) {
                        return;
                    }

                    // Traverse up the tree
                    parent = DOM.closest(parent, function(item) {
                        return item == self;
                    });

                    if (parent !== self) {
                        // handle event if we actually just moused on to a non sub-element
                        Event._handle(self, event);
                    }

                    // assuming we've left the element since we most likely mousedover a xul element
                } catch(e) {
                    S.log("withinElement :" + e);
                }
            }


            Event.special[o.name] = {

                // 第一�?mouseenter 时注册下
                // 以后都直接放�?listener 数组里， �?mouseover 读取触发
                setup: function() {
                    Event.add(this, o.fix, withinElement);
                },

                //�?listener 数组为空时，也清�?mouseover 注册，不再读�?
                tearDown:function() {
                    Event.remove(this, o.fix, withinElement);
                }
            }
        });
    }

    return Event;
}, {
        requires:["./base","dom","ua"]
    });

/**
 * 承玉�?011-06-07
 * - 根据新结构，调整 mouseenter 兼容处理
 * - fire('mouseenter') 可以的，直接执行 mouseenter �?handlers 用户回调数组
 *
 *
 * TODO:
 *  - ie6 下，原生�?mouseenter/leave 貌似也有 bug, 比如 <div><div /><div /><div /></div>
 *    jQuery 也异常，�?��进一步研�?
 */
/**
 * @module  EventObject
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/object', function(S, undefined) {

    var doc = document,
        props = 'altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which'.split(' ');

    /**
     * KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.currentTarget = currentTarget;
        self.originalEvent = domEvent || { };

        if (domEvent) { // html element
            self.type = domEvent.type;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }

        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = true;
    }

    S.augment(EventObject, {

        _fix: function() {
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
                self.target = self.srcElement || doc; // srcElement might not be defined either
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
                self.which = (self.charCode !== undefined) ? self.charCode : self.keyCode;
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
        preventDefault: function() {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to false (IE)
            else {
                e.returnValue = false;
            }

            this.isDefaultPrevented = true;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function() {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            else {
                e.cancelBubble = true;
            }

            this.isPropagationStopped = true;
        },



        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being exectued
         * on the current target.
         */
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.isImmediatePropagationStopped = true;
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param immediate {boolean} if true additional listeners
         * on the current target will not be executed
         */
        halt: function(immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.preventDefault();
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
 *   - pageX, clientX, scrollLeft, clientLeft 的详细测�?
 */
/**
 * @module  EventTarget
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/target', function(S, Event, DOM, undefined) {

    /**
     * EventTarget provides the implementation for any object to publish,
     * subscribe and fire to custom events.
     */
    return {

        isCustomEventTarget: true,

        fire: function(type, eventData) {
            // no chain ,need data returned
            return Event.fire(this, type, eventData);
        },

        on: function(type, fn, scope) {
            Event.add(this, type, fn, scope);
            return this; // chain
        },

        detach: function(type, fn, scope) {
            Event.remove(this, type, fn, scope);
            return this; // chain
        }
    };
}, {
        /*
         实际上只�?�� dom/data ，但是不要跨模块引用另一模块的子模块�?
         否则会导致build打包文件 dom �?dom-data 重复载入
         */
        requires:["./base","dom"]
    });

/**
 * NOTES:
 *
 *  2010.04
 *   - 初始设想 api: publish, fire, on, detach. 实际实现时发现，publish 不是必须
 *     的，on 时能自动 publish. api �?��为：触发/订阅/反订�?
 *
 *   - detach 命名是因�?removeEventListener 太长，remove 则太容易冲突
 */
/**
 * inspired by yui3 :
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
 * @author:yiminghe@gmail.com
 */
KISSY.add('event/valuechange', function(S, Event, DOM) {
    var VALUE_CHANGE = "valueChange",
        KEY = "event/valuechange",
        history = {},
        poll = {},
        interval = 50;

    function timestamp(node) {
        var r = DOM.data(node, KEY);
        if (!r) {
            r = (+new Date());
            DOM.data(node, KEY, r);
        }
        return r;
    }

    function untimestamp(node) {
        DOM.removeData(node, KEY);
    }

    //pre value for input monitored


    function stopPoll(target) {
        var t = timestamp(target);
        delete history[t];
        if (poll[t]) {
            clearTimeout(poll[t]);
            delete poll[t];
        }
    }

    function blur(ev) {
        var target = ev.target;
        stopPoll(target);
    }

    function startPoll(target) {
        var t = timestamp(target);
        if (poll[t]) return;

        poll[t] = setTimeout(function() {
            var v = target.value;
            if (v !== history[t]) {
                Event._handle(target, {
                        type:VALUE_CHANGE,
                        prevVal:history[t],
                        newVal:v
                    });
                history[t] = v;
            }
            poll[t] = setTimeout(arguments.callee, interval);
        }, interval);
    }

    function startPollHandler(ev) {
        var target = ev.target;
        //when focus ,record its previous value
        if (ev.type == "focus") {
            var t = timestamp(target);
            history[t] = target.value;
        }
        startPoll(target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, "blur", blur);
        Event.on(target, "mousedown keyup keydown focus", startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, "blur", blur);
        Event.remove(target, "mousedown keyup keydown focus", startPollHandler);
        untimestamp(target);
    }

    Event.special[VALUE_CHANGE] = {
        //no corresponding dom event needed
        fix: false,
        setup: function() {
            var target = this,
                nodeName = target.nodeName.toLowerCase();
            if ("input" == nodeName
                || "textarea" == nodeName) {
                monitor(target);
            }
        },
        tearDown: function() {
            var target = this;
            unmonitored(target);
        }
    };

    return Event;
}, {
        requires:["./base","dom"]
    });KISSY.add("event", function(S, Event, Target,Object) {
    Event.Target = Target;
    Event.Object=Object;
    return Event;
}, {
    requires:[
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/delegate",
        "event/mouseenter"]
});
