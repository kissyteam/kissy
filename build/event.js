/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  event
 * @author  lifesinger@gmail.com
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


            // Event.add([dom,dom])

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
                special = ((isNativeEventTarget || target._supportSpecialEvent)
                    && Event.special[type]) || { };

                eventHandle = function(event, eventData) {
                    if (!event || !event.fixed) {
                        event = new EventObject(target, event, type);
                    }
                    if (S.isPlainObject(eventData)) {
                        //protect type
                        var typeo = event.type;
                        S.mix(event, eventData);
                        event.type = typeo;
                    }
                    if (special['setup']) {
                        special['setup'](event);
                    }
                    return (special.handle || Event._handle)(target, event);
                };

                events[type] = {
                    handle: eventHandle,
                    listeners: []
                };

                fixedType = special.fix || type;
                capture = special['capture'];
                if (special['init']) {
                    special['init'].apply(null, S.makeArray(arguments));
                }
                if (isNativeEventTarget && special.fix !== false) {
                    simpleAdd(target, fixedType, eventHandle, capture);
                }

            }
            // 增加 listener
            events[type].listeners.push({fn: fn, scope: scope || target});
        },

        __getListeners:function(target, type) {
            var events = Event.__getEvents(target) || {},
                eventsType,
                listeners = [];

            if ((eventsType = events[type])) {
                listeners = eventsType.listeners;
            }
            return listeners;
        },
        __getEvents:function(target) {
            var id = getID(target),c,
                events;
            if (id === -1) return; // 不是有效的 target
            if (!id || !(c = cache[id])) return; // 无 cache
            if (c.target !== target) return; // target 不匹配
            events = c.events || { };
            return events;
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(target, type /* optional */, fn /* optional */, scope /* optional */) {
            if (batch('remove', target, type, fn, scope)) return;

            var events = Event.__getEvents(target),
                id = getID(target),
                eventsType,
                listeners,
                len,
                i,
                j,
                t,
                isNativeEventTarget = !target.isCustomEventTarget,
                special = ((isNativeEventTarget || target._supportSpecialEvent)
                    && Event.special[type]) || { };


            if (events === undefined) return;
            scope = scope || target;

            if ((eventsType = events[type])) {
                listeners = eventsType.listeners;
                len = listeners.length;

                // 移除 fn
                if (S.isFunction(fn) && len) {
                    for (i = 0,j = 0,t = []; i < len; ++i) {
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
                        if (special.fix !== false)
                            simpleRemove(target, special.fix || type, eventsType.handle);
                    }
                    delete events[type];
                }
            }
            if (special.destroy) {
                special.destroy.apply(null, S.makeArray(arguments));
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

        _handle: function(target, event) {
            /* As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.*/
            var listeners = Event.__getListeners(target, event.type);
            listeners = listeners.slice(0);
            var ret, i = 0, len = listeners.length, listener;

            for (; i < len; ++i) {
                listener = listeners[i];
                ret = listener.fn.call(listener.scope, event);

                // 和 jQuery 逻辑保持一致
                // return false 等价 preventDefault + stopProgation
                if (ret !== undefined) {
                    event.result = ret;
                    if (ret === false) {
                        event.halt();
                    }
                }
                if (event.isImmediatePropagationStopped) {
                    break;
                }
            }

            return ret;
        },

        _getCache: function(id) {
            return cache[id];
        },

        __getID:getID,

        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;

    function batch(methodName, targets, types, fn, scope) {
        // on('#id tag.className', type, fn)
        if (S['isString'](targets)) {
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
        return undefined;
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

    return Event;
}, {
    requires:["dom","event/object"]
});

/**
 * TODO:
 *   - event || window.event, 什么情况下取 window.event ? IE4 ?
 *   - 更详尽细致的 test cases
 *   - 内存泄漏测试
 *   - target 为 window, iframe 等特殊对象时的 test case
 *   - special events 的 teardown 方法缺失，需要做特殊处理
 */
/**
 * @module  event-focusin
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/focusin', function(S,Event) {

    // 让非 IE 浏览器支持 focusin/focusout
    if (document.addEventListener) {
        S.each([
            { name: 'focusin', fix: 'focus' },
            { name: 'focusout', fix: 'blur' }
        ], function(o) {

            Event.special[o.name] = {

                fix: o.fix,

                capture: true,

                setup: function(event) {
                    event.type = o.name;
                }
            }
        });
    }
},{
    requires:["event/base"]
});

/**
 * NOTES:
 *  - webkit 和 opera 已支持 DOMFocusIn/DOMFocusOut 事件，但上面的写法已经能达到预期效果，暂时不考虑原生支持。
 */
/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com,xiaohu@taobao.com
 */
KISSY.add('event/hashchange', function(S, Event, DOM,UA) {

    var doc = document,
        HASH_CHANGE = 'hashchange',
        docMode = doc['documentMode'],
        ie = docMode || UA['ie'];


    // IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
    if ((!( 'on' + HASH_CHANGE in window)) || ie < 8) {
        var timer, targets = [], lastHash = getHash();

        Event.special[HASH_CHANGE] = {
            //不用注册dom事件
            fix: false,
            init: function(target) {
                var index = S.indexOf(target, targets);

                if (-1 === index) {
                    targets.push(target);
                }

                if (!timer) {
                    setup();
                }
            },
            destroy: function(target, type) {
                var events = Event.__getEvents(target);
                if (!events[type]) {
                    var index = S.indexOf(target, targets);
                    if (index >= 0)
                        targets.splice(index, 1);
                }
                if (targets.length === 0) {
                    teardown();
                }
            }
        };

        var setup = function() {
            poll();
        },
            teardown = function() {
                timer && clearTimeout(timer);
                timer = null;
            };

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

        // ie6, 7, 用匿名函数来覆盖一些function
        8 > ie && (function() {
            var iframe;

            /**
             * 前进后退 : start -> notifyHashChange
             * 直接输入 : poll -> hashChange -> start
             * iframe 内容和 url 同步
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
                     * 前进后退 ： start -> timer
                     * 直接输入 : timer -> hashChange -> start
                     * 触发统一在 start(load)
                     * iframe 内容和 url 同步
                     */
                    //后退触发点
                    //或addHistory 调用
                    function start() {
                        //console.log('iframe start load..');
                        //debugger
                        var c = S.trim(iframe.contentWindow.document.body.innerHTML);
                        var ch = getHash();

                        //后退时不等
                        //改变location则相等
                        if (c != ch) {
                            location.hash = c;
                            // 使lasthash为iframe历史， 不然重新写iframe， 会导致最新状态（丢失前进状态）
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
                    doc.open();
                    doc.write(html);
                    doc.close();
                    return true;
                } catch (e) {
                    return false;
                }
            };

        })();


        function notifyHashChange(hash) {
            S.log("hash changed : " + hash);
            for (var i = 0; i < targets.length; i++) {
                var t = targets[i];
                //模拟暂时没有属性
                Event._handle(t, {
                    type: HASH_CHANGE
                });
            }
        }


        function getHash() {
            var url = location.href;
            return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
        }
    }
}, {
    requires:["event/base","dom","ua"]
});

/**
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 *//**
 * @module  event-mouseenter
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/mouseenter', function(S, Event,DOM, UA) {

    if (!UA['ie']) {
        S.each([
            { name: 'mouseenter', fix: 'mouseover' },
            { name: 'mouseleave', fix: 'mouseout' }
        ], function(o) {

            Event.special[o.name] = {

                fix: o.fix,

                setup: function(event) {
                    event.type = o.name;
                },

                handle: function(el, event) {
                    // 保证 el 为原生 DOMNode
                    if (DOM._isKSNode(el)) {
                        el = el[0];
                    }

                    // Check if mouse(over|out) are still within the same parent element
                    var parent = event.relatedTarget;

                    // Firefox sometimes assigns relatedTarget a XUL element
                    // which we cannot access the parentNode property of
                    try {
                        // Traverse up the tree
                        while (parent && parent !== el) {
                            parent = parent.parentNode;
                        }

                        if (parent !== el) {
                            // handle event if we actually just moused on to a non sub-element
                            Event._handle(el, event);
                        }
                    } catch(e) {
                        S.log(e);
                    }
                }
            }
        });
    }
}, {
    requires:["event/base","dom","ua"]
});

/**
 * TODO:
 *  - ie6 下，原生的 mouseenter/leave 貌似也有 bug, 比如 <div><div /><div /><div /></div>
 *    jQuery 也异常，需要进一步研究
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
 *   - pageX, clientX, scrollLeft, clientLeft 的详细测试
 */
/**
 * @module  EventTarget
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/target', function(S, Event,DOM,undefined) {

    /**
     * EventTarget provides the implementation for any object to publish,
     * subscribe and fire to custom events.
     */
    return {

        isCustomEventTarget: true,

        fire: function(type, eventData) {
            var id = DOM.data(this, Event.EVENT_GUID) || -1,
                cache = Event._getCache(id) || { },
                events = cache.events || { },
                t = events[type];

            if (t && S.isFunction(t.handle)) {
                return t.handle(undefined, eventData);
            }
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
    requires:["event/base","dom/data"]
});

/**
 * NOTES:
 *
 *  2010.04
 *   - 初始设想 api: publish, fire, on, detach. 实际实现时发现，publish 不是必须
 *     的，on 时能自动 publish. api 简化为：触发/订阅/反订阅
 *
 *   - detach 命名是因为 removeEventListener 太长，remove 则太容易冲突
 */
/**
 * @module  event-spec
 * @author  gonghao<gonghao@ghsky.com>
 */
describe('event', function() {

    var doc = document,
        S = KISSY, Event = S.Event,

        HAPPENED = 'happened',
        FIRST = '1',
        SECOND = '2',
        SEP = '-',

        result,

        // simulate mouse event on any element
        simulate = function(target, type, relatedTarget) {
            if (typeof target === 'string') {
                target = S.get(target);
            }
            jasmine.simulate(target, type, { relatedTarget: relatedTarget });
        };

    describe('add event', function() {

        it('should support batch adding.', function() {
            var lis = S.query('#bar li'), total = lis.length, count = 0;

            Event.on(lis, 'click', function() {
                count++;
            });

            // click all lis
            S.each(lis, function(li) {
                simulate(li, 'click');
            });
            waits(0);
            runs(function() {
                expect(count).toEqual(total);
            });
        });

        it('should execute in order.', function() {
            var a = S.get('#link-a');

            Event.on(a, 'click', function() {
                result.push(FIRST);
            });
            Event.on(a, 'click', function() {
                result.push(SECOND);
            });

            // click a
            result = [];
            simulate(a, 'click');
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });
        });

        it('should prevent default behavior (do nothing if using "return false;").', function() {
            var cb1 = S.get('#checkbox-1'), cb2 = S.get('#checkbox-2');

            // init
            cb1.checked = false;
            cb2.checked = false;

            Event.on(cb1, 'click', function(evt) {
                evt.preventDefault();
            });
            Event.on(cb2, 'click', function() {
                return false;
            });

            // click the checkbox
            cb1.click();
            cb2.click();
            waits(0);
            runs(function() {
                expect(cb1.checked).toBeFalsy();
                expect(cb2.checked).toBeFalsy();
            });
        });

        it('should stop event\'s propagation.', function() {
            var li_c = S.get('#li-c'), c1 = S.get('#link-c1'), c2 = S.get('#link-c2');

            Event.on(c2, 'click', function(evt) {
                evt.stopPropagation();
            });
            Event.on(li_c, 'click', function() {
                result = HAPPENED;
            });

            // click c1
            runs(function() {
                result = null;
                simulate(c1, 'click');
            });
            waits(0);
            runs(function() {
                expect(result).toEqual(HAPPENED);
            });

            // click c2
            runs(function() {
                result = null;
                simulate(c2, 'click');
            });
            waits(0);
            runs(function() {
                expect(result).toBeNull();
            });
        });

        it('should stop event\'s propagation immediately.', function() {
            var li_d = S.get('#li-d'),  d1 = S.get('#link-d1'), d2 = S.get('#link-d2');

            Event.on(d1, 'click', function() {
                result.push(FIRST);
            });
            Event.on(d1, 'click', function() {
                result.push(SECOND);
            });

            Event.on(d2, 'click', function(evt) {
                result.push(FIRST);
                evt.stopImmediatePropagation();
            });
            Event.on(d2, 'click', function() {
                result.push(SECOND);
            });

            Event.on(li_d, 'click', function() {
                result.push(HAPPENED);
            });

            // click d1
            runs(function() {
                result = [];
                simulate(d1, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));
            });

            // click d2
            runs(function() {
                result = [];
                simulate(d2, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST].join(SEP));
            });
        });

        it('should do nothing else to event\'s propagation if using "return false;".', function() {
            var li_e = S.get('#li-e'), e1 = S.get('#link-e1'), e2 = S.get('#link-e2');

            Event.on(e1, 'click', function() {
                result.push(FIRST);
            });
            Event.on(e1, 'click', function() {
                result.push(SECOND);
            });

            Event.on(e2, 'click', function() {
                result.push(FIRST);
                return false;
            });
            Event.on(e2, 'click', function() {
                result.push(SECOND);
            });

            Event.on(li_e, 'click', function() {
                result.push(HAPPENED);
            });

            // click e1
            runs(function() {
                result = [];
                simulate(e1, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));
            });

            // click e2
            runs(function() {
                result = [];
                simulate(e2, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });
        });

        it('should set this properly', function() {
            var ret;

            // Node
            runs(function() {

                S.one('#link-test-this').on('click', function() {
                    ret = this;
                });
                simulate('#link-test-this', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.nodeType).toBe(S.Node.TYPE);
            });

            // NodeList
            runs(function() {
                S.all('#link-test-this-all span').on('click', function() {
                    ret = this;
                });
                simulate('#link-test-this-all-span', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.text()).toBe('link for test this');
            });

            // DOM Element
            runs(function() {
                S.Event.on('#link-test-this-dom', 'click', function() {
                    ret = this;
                });
                simulate('#link-test-this-dom', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.nodeType).toBe(1);
            });
        });
    });

    describe('remove event', function() {

        it('should remove the specified event handler function.', function() {
            var f = S.get('#link-f');

            function foo() {
                result = HAPPENED;
            }

            Event.on(f, 'click', foo);
            Event.on(f, 'click', foo);
            Event.remove(f, 'click', foo);

            // click f
            result = null;
            simulate(f, 'click');
            waits(0);
            runs(function() {
                expect(result).toBeNull();
            });
        });

        it('should remove all the event handlers of the specified event type.', function() {
            var g = S.get('#link-g');

            Event.on(g, 'click', function() {
                result.push(FIRST);
            });
            Event.on(g, 'click', function() {
                result.push(SECOND);
            });
            Event.remove(g, 'click');

            // click g
            result = [];
            simulate(g, 'click');
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([].join(SEP));
            });
        });

        it('should reomve all the event handler of the specified element', function() {
            var h = S.get('#link-h');

            Event.on(h, 'click', function() {
                result.push(FIRST);
            });
            Event.on(h, 'click', function() {
                result.push(SECOND);
            });
            Event.remove(h);

            // click h
            result = [];
            simulate(h, 'click');
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([].join(SEP));
            });
        });
    });

    describe('mouseenter and mouseleave', function() {
        var ie = S.UA.ie, outer = S.get('#outer'), inner = S.get('#inner'),
            container = outer.parentNode;

        it('should trigger the mouseenter event on the proper element.', function() {
            var outerCount = 0, innerCount = 0, type = ie ? 'mouseenter' : 'mouseover';

            Event.on(outer, 'mouseenter', function() {
                outerCount++;
            });

            Event.on(inner, 'mouseenter', function() {
                innerCount++;
            });

            // move mouse from the container element to the outer element once
            simulate(outer, type, container);

            // move mouse from the outer element to the inner element twice
            simulate(inner, type, outer);
            simulate(inner, type, outer);

            waits(100);

            runs(function() {
                if (!ie) {
                    expect(outerCount).toEqual(1);
                    expect(innerCount).toEqual(2);
                }
            });
        });

        it('should trigger the mouseleave event on the proper element.', function() {
            var outerCount = 0, innerCount = 0, type = ie ? 'mouseleave' : 'mouseout';

            Event.on(outer, 'mouseleave', function() {
                outerCount++;
            });
            Event.on(inner, 'mouseleave', function() {
                innerCount++;
            });

            // move mouse from the inner element to the outer element once
            simulate(inner, type, outer);

            // move mouse from the outer element to the container element
            simulate(outer, type, container);
            simulate(outer, type, outer.parentNode);

            waits(0);

            runs(function() {
                if (!ie) {
                    expect(outerCount).toEqual(2);
                    expect(innerCount).toEqual(1);
                }
            });
        });
    });

    describe('focusin and focusout', function() {

        it('should trigger the focusin/focusout event on the proper element, and support bubbling.', function() {
            var container = S.get('#test-focusin'), input = S.get('input', container);

            // In non-IE, the simulation of focusin/focusout behavior do not correspond with IE exactly,
            // so we should ignore the orders of the event
            Event.on(container, 'focusin focusout', function() {
                result.push(HAPPENED);
            });
            Event.on(input, 'focusin focusout', function() {
                result.push(HAPPENED);
            });

            // focus the input element
            runs(function() {
                result = [];
                input.focus();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([HAPPENED, HAPPENED].join(SEP));
            });

            // blur the input element
            runs(function() {
                result = [];
                input.blur();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([HAPPENED, HAPPENED].join(SEP));
            });
        });

        it('should trigger the focusin/focusout event and focus event in order.', function() {
            var input = S.get('#test-focusin-input');

            Event.on(input, 'focusin focusout', function() {
                result.push(FIRST);
            });
            Event.on(input, 'focus blur', function() {
                result.push(SECOND);
            });

            // focus the input element
            runs(function() {
                result = [];
                input.focus();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });

            // blur the input element
            runs(function() {
                result = [];
                input.blur();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });
        });
    });

    describe('event handler scope', function() {

        it('should treat the element itself as the scope.', function() {
            var foo = S.get('#foo');

            Event.on(foo, 'click', function() {
                expect(this).toBe(foo);
            });

            // click foo
            simulate(foo, 'click');
        });

        it('should support using custom object as the scope.', function() {
            var bar = S.get('#bar'),
                TEST = {
                    foo: 'only for tesing'
                };

            Event.on(bar, 'click', function() {
                expect(this).toBe(TEST);
            }, TEST);
        });

        it('should guarantee separate event adding function keeps separate scope.', function() {
            Event.on(doc, 'click', handler, {id: FIRST});
            Event.on(doc, 'click', handler, {id: SECOND});

            function handler() {
                result.push(this.id);
            }

            // click the document twice
            simulate(doc, 'click');
            simulate(doc, 'click');
            waits(0);
            runs(function() {
                expect(result[1]).not.toEqual(result[2]);
            });
        });
    });

    describe('custom event target', function() {

        it('should support custom event target.', function() {

            var SPEED = '70 km/h', NAME = 'Lady Gogo', dog;

            function Dog(name) {
                this.name = name;
            }

            S.augment(Dog, S.EventTarget, {
                run: function() {
                    this.fire('running', {speed: SPEED});
                }
            });

            dog = new Dog(NAME);
            dog.on('running', function(ev) {
                result.push(this.name);
                result.push(ev.speed);
            });
            dog.on('running', function() {
                result.push(FIRST);
                return false;
            });
            function f() {
                result.push(SECOND);
            }

            dog.on('running', f);

            // let dog run
            result = [];
            dog.run();
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([NAME, SPEED, FIRST, SECOND].join(SEP));
            });

            // test detach
            runs(function() {
                result = [];
                dog.detach('running', f);
                dog.run();
                waits(0);
                runs(function() {
                    expect(result.join(SEP)).toEqual([NAME, SPEED, FIRST].join(SEP));
                });
            });
        });
    });


    it('should detach properly', function() {
        var ret;

        // Node
        runs(function() {
            var node = S.one('#link-detach')

            function t() {
                ret = 1;
            }

            node.on('click', t);
            //debugger
            S.one('#link-detach').detach('click', t);

            simulate('#link-detach', 'click');
        });
        waits(10);
        runs(function() {
            expect(ret).toBeUndefined();
        });
    });
});
KISSY.add("event", function(S, Event) {
    return Event;
}, {
    requires:[
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/mouseenter"]
});