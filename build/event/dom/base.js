/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 1 21:34
*/
/**
 * @ignore
 * setup event/dom api module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/api', function (S, Event, DOM, special, Utils, ObservableDOMEvent, DOMEventObject) {
    var _Utils = Event._Utils;

    function fixType(cfg, type) {
        var s = special[type] || {};
        // in case overwrite by delegateFix/onFix in special events
        // (mouseenter/leave,focusin/out)

        if (!cfg.originalType) {
            if (cfg.selector) {
                if (s['delegateFix']) {
                    cfg.originalType = type;
                    type = s['delegateFix'];
                }
            } else {
                // when on mouseenter , it's actually on mouseover , and observers is saved with mouseover!
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
        cfg = cfg || {};

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
         * @param fn {Function|Object} The event listener or event description object.
         * @param {Function} fn.fn The event listener
         * @param {Function} fn.context The context (this reference) in which the handler function is executed.
         * @param {String|Function} fn.selector filter selector string or function to find right element
         * @param {Boolean} fn.once whether fn will be removed once after it is executed.
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
            eventData._ks_fired = 1;

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
                    // scope undefined 时不能写死在 handlers 中，否则不能保证 clone 时的 this
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
/**
 * @ignore
 * @fileOverview dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base', function (S, Event, KeyCodes, _DOMUtils, Gesture, Special) {
    S.mix(Event, {
        KeyCodes: KeyCodes,
        _DOMUtils: _DOMUtils,
        Gesture: Gesture,
        _Special: Special
    });
    return Event;
}, {
    requires: ['event/base',
        './base/key-codes',
        './base/utils',
        './base/gesture',
        './base/special',
        './base/api',
        './base/change',
        './base/submit',
        './base/focusin',
        './base/hashchange',
        './base/mouseenter',
        './base/mousewheel',
        './base/valuechange']
});

/**
 * @ignore
 * @fileOverview  change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/change', function (S, UA, Event, DOM, special) {
    var doc = S.Env.host.document,
        mode = doc && doc['documentMode'];

    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {

        var R_FORM_EL = /^(?:textarea|input|select)$/i;

        function isFormElement(n) {
            return R_FORM_EL.test(n.nodeName);
        }

        function isCheckBoxOrRadio(el) {
            var type = el.type;
            return type == 'checkbox' || type == 'radio';
        }

        special['change'] = {
            setup: function () {
                var el = this;
                if (isFormElement(el)) {
                    // checkbox/radio only fires change when blur in ie<9
                    // so use another technique from jquery
                    if (isCheckBoxOrRadio(el)) {
                        // change in ie<9
                        // change = propertychange -> click
                        Event.on(el, 'propertychange', propertyChange);
                        Event.on(el, 'click', onClick);
                    } else {
                        // other form elements use native , do not bubble
                        return false;
                    }
                } else {
                    // if bind on parentNode ,lazy bind change event to its form elements
                    // note event order : beforeactivate -> change
                    // note 2: checkbox/radio is exceptional
                    Event.on(el, 'beforeactivate', beforeActivate);
                }
            },
            tearDown: function () {
                var el = this;
                if (isFormElement(el)) {
                    if (isCheckBoxOrRadio(el)) {
                        Event.remove(el, 'propertychange', propertyChange);
                        Event.remove(el, 'click', onClick);
                    } else {
                        return false;
                    }
                } else {
                    Event.remove(el, 'beforeactivate', beforeActivate);
                    S.each(DOM.query('textarea,input,select', el), function (fel) {
                        if (fel.__changeHandler) {
                            fel.__changeHandler = 0;
                            Event.remove(fel, 'change', {fn: changeHandler, last: 1});
                        }
                    });
                }
            }
        };

        function propertyChange(e) {
            // if only checked property 's value is changed
            if (e.originalEvent.propertyName == 'checked') {
                this.__changed = 1;
            }
        }

        function onClick(e) {
            // only fire change after click and checked is changed
            // (only fire change after click on previous unchecked radio)
            if (this.__changed) {
                this.__changed = 0;
                // fire from itself
                Event.fire(this, 'change', e);
            }
        }

        function beforeActivate(e) {
            var t = e.target;
            if (isFormElement(t) && !t.__changeHandler) {
                t.__changeHandler = 1;
                // lazy bind change , always as last handler among user's handlers
                Event.on(t, 'change', {fn: changeHandler, last: 1});
            }
        }

        function changeHandler(e) {
            var fel = this;

            if (
            // in case stopped by user's callback,same with submit
            // http://bugs.jquery.com/ticket/11049
            // see : test/change/bubble.html
                e.isPropagationStopped() ||
                    // checkbox/radio already bubble using another technique
                    isCheckBoxOrRadio(fel)) {
                return;
            }
            var p;
            if (p = fel.parentNode) {
                // fire from parent , itself is handled natively
                Event.fire(p, 'change', e);
            }
        }

    }
}, {
    requires: ['ua', './api', 'dom', './special']
});/**
 * @ignore
 * @fileOverview event-focusin
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/focusin', function (S, UA, Event, special) {
    // 让非 IE 浏览器支持 focusin/focusout
    if (!UA['ie']) {
        S.each([
            { name:'focusin', fix:'focus' },
            { name:'focusout', fix:'blur' }
        ], function (o) {
            var key = S.guid('attaches_' + S.now() + '_');
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

    special['focus'] = {
        delegateFix:'focusin'
    };

    special['blur'] = {
        delegateFix:'focusout'
    };

    return Event;
}, {
    requires:['ua', './api', './special']
});

/*
  承玉:2011-06-07
  - 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 */
/**
 * gesture normalization for pc and touch.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/gesture', function (S) {

    return {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup',
        tap: 'click'
    };

});/**
 * @ignore
 * @fileOverview event-hashchange
 * @author yiminghe@gmail.com, xiaomacji@gmail.com
 */
KISSY.add('event/dom/base/hashchange', function (S, Event, DOM, UA, special) {

    var win = S.Env.host,
        doc = win.document,
        docMode = doc && doc['documentMode'],
        REPLACE_HISTORY = '__replace_history_' + S.now(),
        ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    Event.REPLACE_HISTORY = REPLACE_HISTORY;

    // ie8 支持 hashchange
    // 但IE8以上切换浏览器模式到IE7（兼容模式），
    // 会导致 'onhashchange' in window === true，但是不触发事件

    // 1. 不支持 hashchange 事件，支持 hash 历史导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 历史导航(ie67) : iframe + 定时器
    if ((!( 'on' + HASH_CHANGE in win)) || ie && ie < 8) {

        function getIframeDoc(iframe) {
            return iframe.contentWindow.document;
        }

        var POLL_INTERVAL = 50,
            IFRAME_TEMPLATE = '<html><head><title>' + (doc && doc.title || '') +
                ' - {hash}</title>{head}</head><body>{hash}</body></html>',

            getHash = function () {
                // 不能 location.hash
                // 1.
                // http://xx.com/#yy?z=1
                // ie6 => location.hash = #yy
                // 其他浏览器 => location.hash = #yy?z=1
                // 2.
                // #!/home/q={%22thedate%22:%2220121010~20121010%22}
                // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
                // !! :(
                var uri = new S.Uri(location.href);
                return '#' + uri.getFragment();
            },

            timer,

        // 用于定时器检测，上次定时器记录的 hash 值
            lastHash,

            poll = function () {
                var hash = getHash(), replaceHistory;
                if (replaceHistory = S.endsWith(hash, REPLACE_HISTORY)) {
                    hash = hash.slice(0, -REPLACE_HISTORY.length);
                    // 去除 ie67 hack 标记
                    location.hash = hash;
                }
                if (hash !== lastHash) {
                    // S.log('poll success :' + hash + ' :' + lastHash);
                    // 通知完调用者 hashchange 事件前设置 lastHash
                    lastHash = hash;
                    // ie<8 同步 : hashChange -> onIframeLoad
                    hashChange(hash, replaceHistory);
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie && ie < 8 ? function (hash, replaceHistory) {
                // S.log('set iframe html :' + hash);
                var html = S.substitute(IFRAME_TEMPLATE, {
                        // 防止 hash 里有代码造成 xss
                        // 后面通过 innerText，相当于 unEscapeHTML
                        hash: S.escapeHTML(hash),
                        // 一定要加哦
                        head: DOM.isCustomDomain() ? ("<script>" +
                            "document." +
                            "domain = '" +
                            doc.domain
                            + "';</script>") : ''
                    }),
                    iframeDoc = getIframeDoc(iframe);
                try {
                    // ie 下不留历史记录！
                    if (replaceHistory) {
                        iframeDoc.open("text/html", "replace");
                    } else {
                        // 写入历史 hash
                        iframeDoc.open();
                    }
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
                // S.log('hash changed : ' + getHash());
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
                    var iframeSrc = DOM.getEmptyIframeSrc();
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
                    Event.add(iframe, 'load', function () {
                        Event.remove(iframe, 'load');
                        // Update the iframe with the initial location hash, if any. This
                        // will create an initial history entry that the user can return to
                        // after the state has changed.
                        hashChange(getHash());
                        Event.add(iframe, 'load', onIframeLoad);
                        poll();
                    });

                    // Whenever `document.title` changes, update the Iframe's title to
                    // prettify the back/next history menu entries. Since IE sometimes
                    // errors with 'Unspecified error' the very first time this is set
                    // (yes, very useful) wrap this with a try/catch block.
                    doc.onpropertychange = function () {
                        try {
                            if (event.propertyName === 'title') {
                                getIframeDoc(iframe).title =
                                    doc.title + ' - ' + getHash();
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
                            S.log('set loc hash :' + c);
                            location.hash = c;
                            // 使 last hash 为 iframe 历史， 不然重新写iframe，
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
            setup: function () {
                if (this !== win) {
                    return;
                }
                // 第一次启动 hashchange 时取一下，不能类库载入后立即取
                // 防止类库嵌入后，手动修改过 hash，
                lastHash = getHash();
                // 不用注册 dom 事件
                setup();
            },
            tearDown: function () {
                if (this !== win) {
                    return;
                }
                tearDown();
            }
        };
    }
}, {
    requires: ['./api', 'dom', 'ua', './special']
});

/*
 已知 bug :
 - ie67 有时后退后取得的 location.hash 不和地址栏一致，导致必须后退两次才能触发 hashchange

 v1 : 2010-12-29
 v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 refer : http://yiminghe.javaeye.com/blog/377867
 https://github.com/cowboy/jquery-hashchange
 *//**
 * @ignore
 * @fileOverview some key-codes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/key-codes', function (S, UA) {
    /**
     * @enum {Number} KISSY.Event.KeyCodes
     * All key codes.
     */
    var KeyCodes = {
        /**
         * MAC_ENTER
         */
        MAC_ENTER: 3,
        /**
         * BACKSPACE
         */
        BACKSPACE: 8,
        /**
         * TAB
         */
        TAB: 9,
        /**
         * NUMLOCK on FF/Safari Mac
         */
        NUM_CENTER: 12, // NUMLOCK on FF/Safari Mac
        /**
         * ENTER
         */
        ENTER: 13,
        /**
         * SHIFT
         */
        SHIFT: 16,
        /**
         * CTRL
         */
        CTRL: 17,
        /**
         * ALT
         */
        ALT: 18,
        /**
         * PAUSE
         */
        PAUSE: 19,
        /**
         * CAPS_LOCK
         */
        CAPS_LOCK: 20,
        /**
         * ESC
         */
        ESC: 27,
        /**
         * SPACE
         */
        SPACE: 32,
        /**
         * PAGE_UP
         */
        PAGE_UP: 33, // also NUM_NORTH_EAST
        /**
         * PAGE_DOWN
         */
        PAGE_DOWN: 34, // also NUM_SOUTH_EAST
        /**
         * END
         */
        END: 35, // also NUM_SOUTH_WEST
        /**
         * HOME
         */
        HOME: 36, // also NUM_NORTH_WEST
        /**
         * LEFT
         */
        LEFT: 37, // also NUM_WEST
        /**
         * UP
         */
        UP: 38, // also NUM_NORTH
        /**
         * RIGHT
         */
        RIGHT: 39, // also NUM_EAST
        /**
         * DOWN
         */
        DOWN: 40, // also NUM_SOUTH
        /**
         * PRINT_SCREEN
         */
        PRINT_SCREEN: 44,
        /**
         * INSERT
         */
        INSERT: 45, // also NUM_INSERT
        /**
         * DELETE
         */
        DELETE: 46, // also NUM_DELETE
        /**
         * ZERO
         */
        ZERO: 48,
        /**
         * ONE
         */
        ONE: 49,
        /**
         * TWO
         */
        TWO: 50,
        /**
         * THREE
         */
        THREE: 51,
        /**
         * FOUR
         */
        FOUR: 52,
        /**
         * FIVE
         */
        FIVE: 53,
        /**
         * SIX
         */
        SIX: 54,
        /**
         * SEVEN
         */
        SEVEN: 55,
        /**
         * EIGHT
         */
        EIGHT: 56,
        /**
         * NINE
         */
        NINE: 57,
        /**
         * QUESTION_MARK
         */
        QUESTION_MARK: 63, // needs localization
        /**
         * A
         */
        A: 65,
        /**
         * B
         */
        B: 66,
        /**
         * C
         */
        C: 67,
        /**
         * D
         */
        D: 68,
        /**
         * E
         */
        E: 69,
        /**
         * F
         */
        F: 70,
        /**
         * G
         */
        G: 71,
        /**
         * H
         */
        H: 72,
        /**
         * I
         */
        I: 73,
        /**
         * J
         */
        J: 74,
        /**
         * K
         */
        K: 75,
        /**
         * L
         */
        L: 76,
        /**
         * M
         */
        M: 77,
        /**
         * N
         */
        N: 78,
        /**
         * O
         */
        O: 79,
        /**
         * P
         */
        P: 80,
        /**
         * Q
         */
        Q: 81,
        /**
         * R
         */
        R: 82,
        /**
         * S
         */
        S: 83,
        /**
         * T
         */
        T: 84,
        /**
         * U
         */
        U: 85,
        /**
         * V
         */
        V: 86,
        /**
         * W
         */
        W: 87,
        /**
         * X
         */
        X: 88,
        /**
         * Y
         */
        Y: 89,
        /**
         * Z
         */
        Z: 90,
        /**
         * META
         */
        META: 91, // WIN_KEY_LEFT
        /**
         * WIN_KEY_RIGHT
         */
        WIN_KEY_RIGHT: 92,
        /**
         * CONTEXT_MENU
         */
        CONTEXT_MENU: 93,
        /**
         * NUM_ZERO
         */
        NUM_ZERO: 96,
        /**
         * NUM_ONE
         */
        NUM_ONE: 97,
        /**
         * NUM_TWO
         */
        NUM_TWO: 98,
        /**
         * NUM_THREE
         */
        NUM_THREE: 99,
        /**
         * NUM_FOUR
         */
        NUM_FOUR: 100,
        /**
         * NUM_FIVE
         */
        NUM_FIVE: 101,
        /**
         * NUM_SIX
         */
        NUM_SIX: 102,
        /**
         * NUM_SEVEN
         */
        NUM_SEVEN: 103,
        /**
         * NUM_EIGHT
         */
        NUM_EIGHT: 104,
        /**
         * NUM_NINE
         */
        NUM_NINE: 105,
        /**
         * NUM_MULTIPLY
         */
        NUM_MULTIPLY: 106,
        /**
         * NUM_PLUS
         */
        NUM_PLUS: 107,
        /**
         * NUM_MINUS
         */
        NUM_MINUS: 109,
        /**
         * NUM_PERIOD
         */
        NUM_PERIOD: 110,
        /**
         * NUM_DIVISION
         */
        NUM_DIVISION: 111,
        /**
         * F1
         */
        F1: 112,
        /**
         * F2
         */
        F2: 113,
        /**
         * F3
         */
        F3: 114,
        /**
         * F4
         */
        F4: 115,
        /**
         * F5
         */
        F5: 116,
        /**
         * F6
         */
        F6: 117,
        /**
         * F7
         */
        F7: 118,
        /**
         * F8
         */
        F8: 119,
        /**
         * F9
         */
        F9: 120,
        /**
         * F10
         */
        F10: 121,
        /**
         * F11
         */
        F11: 122,
        /**
         * F12
         */
        F12: 123,
        /**
         * NUMLOCK
         */
        NUMLOCK: 144,
        /**
         * SEMICOLON
         */
        SEMICOLON: 186, // needs localization
        /**
         * DASH
         */
        DASH: 189, // needs localization
        /**
         * EQUALS
         */
        EQUALS: 187, // needs localization
        /**
         * COMMA
         */
        COMMA: 188, // needs localization
        /**
         * PERIOD
         */
        PERIOD: 190, // needs localization
        /**
         * SLASH
         */
        SLASH: 191, // needs localization
        /**
         * APOSTROPHE
         */
        APOSTROPHE: 192, // needs localization
        /**
         * SINGLE_QUOTE
         */
        SINGLE_QUOTE: 222, // needs localization
        /**
         * OPEN_SQUARE_BRACKET
         */
        OPEN_SQUARE_BRACKET: 219, // needs localization
        /**
         * BACKSLASH
         */
        BACKSLASH: 220, // needs localization
        /**
         * CLOSE_SQUARE_BRACKET
         */
        CLOSE_SQUARE_BRACKET: 221, // needs localization
        /**
         * WIN_KEY
         */
        WIN_KEY: 224,
        /**
         * MAC_FF_META
         */
        MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
        /**
         * WIN_IME
         */
        WIN_IME: 229
    };

    /**
     * whether text and modified key is entered at the same time.
     * @param {KISSY.Event.DOMEventObject} e event object
     * @return {Boolean}
     */
    KeyCodes.isTextModifyingKeyEvent = function (e) {
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

    /**
     * whether character is entered.
     * @param {KISSY.Event.KeyCodes} keyCode
     * @return {Boolean}
     */
    KeyCodes.isCharacterKey = function (keyCode) {
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
        if (UA.webkit && keyCode == 0) {
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

}, {
    requires: ['ua']
});/**
 * @ignore
 * @fileOverview event-mouseenter
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/mouseenter', function (S, Event, DOM, UA, special) {
    S.each([
        { name: 'mouseenter', fix: 'mouseover' },
        { name: 'mouseleave', fix: 'mouseout' }
    ], function (o) {
        special[o.name] = {
            // fix #75
            onFix: o.fix,
            // all browser need
            delegateFix: o.fix,
            handle: function (event, observer, ce) {
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
                    // 2012-04-12 把 mouseover 阻止冒泡有问题！
                    // <div id='0'><div id='1'><div id='2'><div id='3'></div></div></div></div>
                    // 2 mouseover 停止冒泡
                    // 然后快速 2,1 飞过，可能 1 的 mouseover 是 2 冒泡过来的
                    // mouseover 采样时跳跃的，可能 2,1 的 mouseover 事件
                    // target 都是 3,而 relatedTarget 都是 0
                    // event.stopPropagation();
                    return [observer.simpleNotify(event, ce)];
                }
            }
        };
    });

    return Event;
}, {
    requires: ['./api', 'dom', 'ua', './special']
});

/*
 yiminghe@gmail.com:2011-12-15
 - 借鉴 jq 1.7 新的架构

 承玉：2011-06-07
 - 根据新结构，调整 mouseenter 兼容处理
 - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 */
/**
 * @ignore
 * @fileOverview normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/mousewheel', function (S, special,UA) {

    var MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';

    special['mousewheel'] = {
        onFix: MOUSE_WHEEL,
        delegateFix: MOUSE_WHEEL
    };

}, {
    requires: ['./special','ua']
});/**
 * @ignore
 * @fileOverview event object for dom
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/object', function (S, Event) {

    var doc = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        props = ('type altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis ' +
            'changedTouches touches targetTouches rotation scale').split(' ');

    /**
     * KISSY 's dom event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     *
     * @class KISSY.Event.DOMEventObject
     * @param domEvent native dom event
     */
    function DOMEventObject(domEvent) {
        var self = this;
        self.originalEvent = domEvent;
        // in case dom event has been mark as default prevented by lower dom node
        self.isDefaultPrevented = ( domEvent['defaultPrevented'] || domEvent.returnValue === FALSE ||
            domEvent['getPreventDefault'] && domEvent['getPreventDefault']() ) ? function () {
            return TRUE;
        } : function () {
            return FALSE;
        };
        fix(self);
        fixMouseWheel(self);
        /**
         * source html node of current event
         * @cfg {HTMLElement} target
         */
        /**
         * current htm node which processes current event
         * @cfg {HTMLElement} currentTarget
         */
    }

    function fix(self) {
        var originalEvent = self.originalEvent,
            l = props.length,
            prop,
            ct = originalEvent.currentTarget,
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

        // check if target is a text node (safari)
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
    }

    function fixMouseWheel(e) {
        var deltaX,
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

        S.mix(e, {
            deltaY: deltaY,
            delta: delta,
            deltaX: deltaX
        });
    }

    S.extend(DOMEventObject, Event._Object, {

        constructor: DOMEventObject,

        preventDefault: function () {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to FALSE (IE)
            else {
                e.returnValue = FALSE;
            }

            DOMEventObject.superclass.preventDefault.call(this);
        },

        stopPropagation: function () {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to TRUE (IE)
            else {
                e.cancelBubble = TRUE;
            }

            DOMEventObject.superclass.stopPropagation.call(this);
        }
    });

    return DOMEventObject;

}, {
    requires: ['event/base']
});

/*
 2012-10-30
 - consider touch properties

 2012-10-24
 - merge with mousewheel: not perfect in osx : accelerated scroll

 2010.04
 - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html

 - refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 *//**
 * @ignore
 * custom event for dom.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/observable', function (S, DOM, special, Utils, DOMEventObserver, DOMEventObject, Event) {

    // 记录手工 fire(domElement,type) 时的 type
    // 再在浏览器通知的系统 eventHandler 中检查
    // 如果相同，那么证明已经 fire 过了，不要再次触发了
    var _Utils = Event._Utils;

    /**
     * custom event for dom
     * @param {Object} cfg
     * @class KISSY.Event.ObservableDOMEvent
     */
    function ObservableDOMEvent(cfg) {
        var self = this;
        S.mix(self, cfg);
        self.reset();
        /**
         * html node which binds current custom event
         * @cfg {HTMLElement} currentTarget
         */
    }

    S.extend(ObservableDOMEvent, Event._ObservableEvent, {

        setup: function () {
            var self = this,
                type = self.type,
                s = special[type] || {},
                currentTarget = self.currentTarget,
                eventDesc = Utils.data(currentTarget),
                handle = eventDesc.handle;
            // 第一次注册该事件，dom 节点才需要注册 dom 事件
            if (!s.setup || s.setup.call(currentTarget,type) === false) {
                Utils.simpleAdd(currentTarget, type, handle)
            }
        },

        constructor: ObservableDOMEvent,

        reset: function () {
            var self = this;
            ObservableDOMEvent.superclass.reset.call(self);
            self.delegateCount = 0;
            self.lastCount = 0;
        },

        /**
         * notify current event 's observers
         * @param {KISSY.Event.DOMEventObject} event
         * @return {*} return false if one of custom event 's observers  else
         * return last value of custom event 's observers 's return value.
         */
        notify: function (event) {
            /*
             As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.
             */
            /*
             DOM3 Events: EventListenerList objects in the DOM are live. ??
             */
            var target = event['target'],
                self = this,
                currentTarget = self.currentTarget,
                observers = self.observers,
                currentTarget0,
                allObservers = [],
                ret,
                gRet,
                observerObj,
                i,
                j,
                delegateCount = self.delegateCount || 0,
                len,
                currentTargetObservers,
                currentTargetObserver,
                observer;

            // collect delegated observers and corresponding element
            // by jq
            // Avoid disabled elements in IE (#6911)
            // non-left-click bubbling in Firefox (#3861),firefox 8 fix it
            if (delegateCount && !target.disabled) {
                while (target != currentTarget) {
                    currentTargetObservers = [];
                    for (i = 0; i < delegateCount; i++) {
                        observer = observers[i];
                        if (DOM.test(target, observer.selector)) {
                            currentTargetObservers.push(observer);
                        }
                    }
                    if (currentTargetObservers.length) {
                        allObservers.push({
                            currentTarget: target,
                            'currentTargetObservers': currentTargetObservers
                        });
                    }
                    target = target.parentNode || currentTarget;
                }
            }

            // root node's observers is placed at end position of add observers
            // in case child node stopPropagation of root node's observers
            allObservers.push({
                currentTarget: currentTarget,
                currentTargetObservers: observers.slice(delegateCount)
            });

            for (i = 0, len = allObservers.length; !event.isPropagationStopped() && i < len; ++i) {

                observerObj = allObservers[i];
                currentTargetObservers = observerObj.currentTargetObservers;
                currentTarget0 = observerObj.currentTarget;
                event.currentTarget = currentTarget0;

                for (j = 0; !event.isImmediatePropagationStopped() && j < currentTargetObservers.length; j++) {

                    currentTargetObserver = currentTargetObservers[j];

                    ret = currentTargetObserver.notify(event, self);

                    // 和 jQuery 逻辑保持一致
                    // 有一个 false，最终结果就是 false
                    // 否则等于最后一个返回值
                    if (gRet !== false) {
                        gRet = ret;
                    }
                }
            }

            // fire 时判断如果 preventDefault，则返回 false 否则返回 true
            // 这里返回值意义不同
            return gRet;
        },

        /**
         * fire dom event from bottom to up , emulate dispatchEvent in DOM3 Events
         * @param {Object|KISSY.Event.DOMEventObject} [event] additional event data
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fire: function (event, onlyHandlers/*internal usage*/) {

            event = event || {};

            var self = this,
                eventType = self.type,
                s = special[eventType];

            // TODO bug: when fire mouseenter, it also fire mouseover in firefox/chrome
            if (s && s['onFix']) {
                eventType = s['onFix'];
            }

            var customEvent,
                eventData,
                currentTarget = self.currentTarget,
                ret = true;

            event.type = eventType;

            if (!(event instanceof DOMEventObject)) {
                eventData = event;
                event = new DOMEventObject({
                    currentTarget: currentTarget,
                    target: currentTarget
                });
                S.mix(event, eventData);
            }

            // onlyHandlers is equal to event.halt()
            // but we can not call event.halt()
            // because handle will check event.isPropagationStopped
            var cur = currentTarget,
                t,
                win = DOM._getWin(cur.ownerDocument || cur),
                ontype = 'on' + eventType;

            //bubble up dom tree
            do {
                event.currentTarget = cur;
                customEvent = ObservableDOMEvent.getCustomEvent(cur, eventType);
                // default bubble for html node
                if (customEvent) {
                    t = customEvent.notify(event);
                    if (ret !== false) {
                        ret = t;
                    }
                }
                // Trigger an inline bound script
                if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                    event.preventDefault();
                }
                // Bubble up to document, then to window
                cur = cur.parentNode || cur.ownerDocument ||
                    (cur === currentTarget.ownerDocument) && win;
            } while (!onlyHandlers && cur && !event.isPropagationStopped());

            if (!onlyHandlers && !event.isDefaultPrevented()) {

                // now all browser support click
                // https://developer.mozilla.org/en-US/docs/DOM/element.click

                var old;

                try {
                    // execute default action on dom node
                    // so exclude window
                    // exclude focus/blue on hidden element
                    if (ontype && currentTarget[ eventType ] &&
                        (
                            (
                                eventType !== 'focus' && eventType !== 'blur') ||
                                currentTarget.offsetWidth !== 0
                            ) &&
                        !S.isWindow(currentTarget)) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = currentTarget[ ontype ];

                        if (old) {
                            currentTarget[ ontype ] = null;
                        }

                        // 记录当前 trigger 触发
                        ObservableDOMEvent.triggeredEvent = eventType;

                        // 只触发默认事件，而不要执行绑定的用户回调
                        // 同步触发
                        currentTarget[ eventType ]();
                    }
                } catch (eError) {
                    S.log('trigger action error: ');
                    S.log(eError);
                }

                if (old) {
                    currentTarget[ ontype ] = old;
                }

                ObservableDOMEvent.triggeredEvent = '';

            }
            return ret;
        },

        /**
         * add a observer to custom event's observers
         * @param {Object} cfg {@link KISSY.Event.DOMEventObserver} 's config
         */
        on: function (cfg) {
            var self = this,
                observers = self.observers,
                s = special[self.type] || {},
            // clone event
                observer = cfg instanceof DOMEventObserver ? cfg : new DOMEventObserver(cfg);

            if (self.findObserver(observer) == -1) {
                // 增加 listener
                if (observer.selector) {
                    observers.splice(self.delegateCount, 0, observer);
                    self.delegateCount++;
                } else {
                    if (observer.last) {
                        observers.push(observer);
                        self.lastCount++;
                    } else {
                        observers.splice(observers.length - self.lastCount, 0, observer);
                    }
                }

                if (s.add) {
                    s.add.call(self.currentTarget, observer);
                }
            }
        },

        /**
         * remove some observers from current event 's observers by observer config param
         * @param {Object} cfg {@link KISSY.Event.DOMEventObserver} 's config
         */
        detach: function (cfg) {
            var groupsRe,
                self = this,
                s = special[self.type] || {},
                hasSelector = 'selector' in cfg,
                selector = cfg.selector,
                context = cfg.context,
                fn = cfg.fn,
                currentTarget = self.currentTarget,
                observers = self.observers,
                groups = cfg.groups;

            if (!observers.length) {
                return;
            }

            if (groups) {
                groupsRe = _Utils.getGroupsRe(groups);
            }

            var i, j, t, observer, observerContext, len = observers.length;

            // 移除 fn
            if (fn || hasSelector || groupsRe) {
                context = context || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    observer = observers[i];
                    observerContext = observer.context || currentTarget;
                    if (
                        (context != observerContext) ||
                            // 指定了函数，函数不相等，保留
                            (fn && fn != observer.fn) ||
                            // 1.没指定函数
                            // 1.1 没有指定选择器,删掉 else2
                            // 1.2 指定选择器,字符串为空
                            // 1.2.1 指定选择器,字符串为空,待比较 observer 有选择器,删掉 else
                            // 1.2.2 指定选择器,字符串为空,待比较 observer 没有选择器,保留
                            // 1.3 指定选择器,字符串不为空,字符串相等,删掉 else
                            // 1.4 指定选择器,字符串不为空,字符串不相等,保留
                            // 2.指定了函数且函数相等
                            // 2.1 没有指定选择器,删掉 else
                            // 2.2 指定选择器,字符串为空
                            // 2.2.1 指定选择器,字符串为空,待比较 observer 有选择器,删掉 else
                            // 2.2.2 指定选择器,字符串为空,待比较 observer 没有选择器,保留
                            // 2.3 指定选择器,字符串不为空,字符串相等,删掉  else
                            // 2.4 指定选择器,字符串不为空,字符串不相等,保留
                            (
                                hasSelector &&
                                    (
                                        (selector && selector != observer.selector) ||
                                            (!selector && !observer.selector)
                                        )
                                ) ||

                            // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                            (groupsRe && !observer.groups.match(groupsRe))
                        ) {
                        t[j++] = observer;
                    } else {
                        if (observer.selector && self.delegateCount) {
                            self.delegateCount--;
                        }
                        if (observer.last && self.lastCount) {
                            self.lastCount--;
                        }
                        if (s.remove) {
                            s.remove.call(currentTarget, observer);
                        }
                    }
                }

                self.observers = t;
            } else {
                // 全部删除
                self.reset();
            }

            self.checkMemory();
        },

        checkMemory: function () {
            var self = this,
                type = self.type,
                events,
                handle,
                s = special[type] || {},
                currentTarget = self.currentTarget,
                eventDesc = Utils.data(currentTarget);
            if (eventDesc) {
                events = eventDesc.events;
                if (!self.hasObserver()) {
                    handle = eventDesc.handle;
                    // remove(el, type) or fn 已移除光
                    // dom node need to detach handler from dom node
                    if ((!s['tearDown'] || s['tearDown'].call(currentTarget,type) === false)) {
                        Utils.simpleRemove(currentTarget, type, handle);
                    }
                    // remove currentTarget's single event description
                    delete events[type];
                }

                // remove currentTarget's  all events description
                if (S.isEmptyObject(events)) {
                    eventDesc.handle = null;
                    Utils.removeData(currentTarget);
                }
            }
        }
    });

    ObservableDOMEvent.triggeredEvent = '';

    /**
     * get custom event from html node by event type.
     * @param {HTMLElement} node
     * @param {String} type event type
     * @return {KISSY.Event.ObservableDOMEvent}
     */
    ObservableDOMEvent.getCustomEvent = function (node, type) {

        var eventDesc = Utils.data(node), events;
        if (eventDesc) {
            events = eventDesc.events;
        }
        if (events) {
            return events[type];
        }

        return undefined;
    };


    ObservableDOMEvent.getCustomEvents = function (node, create) {
        var eventDesc = Utils.data(node);
        if (!eventDesc && create) {
            Utils.data(node, eventDesc = {});
        }
        return eventDesc;
    };

    return ObservableDOMEvent;

}, {
    requires: ['dom', './special', './utils', './observer', './object', 'event/base']
});/**
 * @ignore
 * observer for dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/observer', function (S, special, Event) {

    /**
     * observer for dom event
     * @class KISSY.Event.DOMEventObserver
     * @extends KISSY.Event.Observer
     */
    function DOMEventObserver(cfg) {
        DOMEventObserver.superclass.constructor.apply(this, arguments);
        /**
         * filter selector string or function to find right element
         * @cfg {String} selector
         */
        /**
         * extra data as second parameter of listener
         * @cfg {*} data
         */
    }

    S.extend(DOMEventObserver, Event._Observer, {

        keys: ['fn', 'selector', 'data', 'context', 'originalType', 'groups', 'last'],

        notifyInternal: function (event, ce) {
            var self = this,
                s, t, ret,
                type = event.type;

            // restore originalType if involving delegate/onFix handlers
            if (self.originalType) {
                event.type = self.originalType;
            }

            // context undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
            if ((s = special[event.type]) && s.handle) {
                t = s.handle(event, self, ce);
                // can handle
                if (t && t.length > 0) {
                    ret = t[0];
                }
            } else {
                ret = self.simpleNotify(event, ce);
            }

            event.type = type;

            return ret;
        }

    });

    return DOMEventObserver;

}, {
    requires: ['./special', 'event/base']
});/**
 * @ignore
 * @fileOverview special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/special', function () {
    return {};
});/**
 * @ignore
 * @fileOverview patch for ie<9 submit: does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/submit', function (S, UA, Event, DOM, special) {

    var doc = S.Env.host.document,
        mode = doc && doc['documentMode'];

    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {
        var getNodeName = DOM.nodeName;
        special['submit'] = {
            setup: function () {
                var el = this;
                // form use native
                if (getNodeName(el) == 'form') {
                    return false;
                }
                // lazy add submit for inside forms
                // note event order : click/keypress -> submit
                // key point : find the forms
                Event.on(el, 'click keypress', detector);
            },
            tearDown: function () {
                var el = this;
                // form use native
                if (getNodeName(el) == 'form') {
                    return false;
                }
                Event.remove(el, 'click keypress', detector);
                S.each(DOM.query('form', el), function (form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, 'submit', {
                            fn: submitBubble,
                            last: 1
                        });
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                nodeName = getNodeName(t),
                form = (nodeName == 'input' || nodeName == 'button') ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, 'submit', {
                    fn: submitBubble,
                    last: 1
                });
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode &&
                // it is stopped by user callback
                !e.isPropagationStopped() &&
                // it is not fired manually
                !e._ks_fired) {
                // simulated bubble for submit
                // fire from parentNode. if form.on('submit') , this logic is never run!
                Event.fire(form.parentNode, 'submit', e);
            }
        }
    }

}, {
    requires: ['ua', './api', 'dom', './special']
});
/*
 modified from jq, fix submit in ie<9
 - http://bugs.jquery.com/ticket/11049
 *//**
 * @ignore
 * @fileOverview utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/utils', function (S, DOM) {
    var EVENT_GUID = 'ksEventTargetId_1.30',
        doc = S.Env.host.document,
        simpleAdd = doc && doc.addEventListener ?
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
        simpleRemove = doc && doc.removeEventListener ?
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
        simpleAdd: simpleAdd,

        simpleRemove: simpleRemove,

        data: function (elem, v) {
            return DOM.data(elem, EVENT_GUID, v);
        },

        removeData: function (elem) {
            return DOM.removeData(elem, EVENT_GUID);
        }
    };

}, {
    requires: ['dom']
});/**
 * @ignore
 * @fileOverview inspired by yui3
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
KISSY.add('event/dom/base/valuechange', function (S, Event, DOM, special) {
    var VALUE_CHANGE = 'valuechange',
        getNodeName = DOM.nodeName,
        KEY = 'event/valuechange',
        HISTORY_KEY = KEY + '/history',
        POLL_KEY = KEY + '/poll',
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
            Event.fireHandler(target, VALUE_CHANGE, {
                prevVal: h,
                newVal: v
            });
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
        if (ev.type == 'focus') {
            DOM.data(target, HISTORY_KEY, target.value);
        }
        startPoll(target);
    }

    function webkitSpeechChangeHandler(e) {
        checkChange(e.target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, 'blur', stopPollHandler);
        // fix #94
        // see note 2012-02-08
        Event.on(target, 'webkitspeechchange', webkitSpeechChangeHandler);
        Event.on(target, 'mousedown keyup keydown focus', startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, 'blur', stopPollHandler);
        Event.remove(target, 'webkitspeechchange', webkitSpeechChangeHandler);
        Event.remove(target, 'mousedown keyup keydown focus', startPollHandler);
    }

    special[VALUE_CHANGE] = {
        setup: function () {
            var target = this, nodeName = getNodeName(target);
            if (nodeName == 'input' || nodeName == 'textarea') {
                monitor(target);
            }
        },
        tearDown: function () {
            var target = this;
            unmonitored(target);
        }
    };
    return Event;
}, {
    requires: ['./api', 'dom', './special']
});

/*
 2012-02-08 yiminghe@gmail.com note about webkitspeechchange :
 当 input 没焦点立即点击语音
 -> mousedown -> blur -> focus -> blur -> webkitspeechchange -> focus
 第二次：
 -> mousedown -> blur -> webkitspeechchange -> focus
 */
