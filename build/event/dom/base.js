/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 9 19:16
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
/**
 * @ignore
 *  dom event facade
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
        './base/mouseenter',
        './base/mousewheel',
        './base/valuechange']
});

/**
 * @ignore
 * gesture normalization for pc and touch.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/gesture', function (S) {

    /**
     * gesture for event
     * @enum {String} KISSY.Event.Gesture
     */
    return {
        /**
         * start gesture
         */
        start: 'mousedown',
        /**
         * move gesture
         */
        move: 'mousemove',
        /**
         * end gesture
         */
        end: 'mouseup',
        /**
         * tap gesture
         */
        tap: 'click',
        /**
         * doubleTap gesture, it is not same with dblclick
         */
        doubleTap:'dblclick'
    };

});/**
 * @ignore
 *  some key-codes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/key-codes', function (S) {
    /**
     * @enum {Number} KISSY.Event.KeyCodes
     * All key codes.
     */
    var UA = S.UA,
        KeyCodes = {
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

});/**
 * @ignore
 *  event-mouseenter
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/mouseenter', function (S, Event, DOM, special) {

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
    requires: ['./api', 'dom', './special']
});

/*
 yiminghe@gmail.com:2011-12-15
 - 借鉴 jq 1.7 新的架构

 yiminghe@gmail.com：2011-06-07
 - 根据新结构，调整 mouseenter 兼容处理
 - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 */
/**
 * @ignore
 *  normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/mousewheel', function (S, special) {

    var UA = S.UA, MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';

    special['mousewheel'] = {
        onFix: MOUSE_WHEEL,
        delegateFix: MOUSE_WHEEL
    };

}, {
    requires: ['./special']
});/**
 * @ignore
 *  event object for dom
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/object', function (S, Event, undefined) {

    var doc = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        props = ('type altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis ' +
            'changedTouches touches targetTouches rotation scale').split(' ');

    /**
     * Do not new by yourself.
     *
     * KISSY 's dom event system normalizes the event object according to
     * W3C standards.
     *
     * The event object is guaranteed to be passed to
     * the event handler.
     *
     * Most properties from the original event are
     * copied over and normalized to the new event object
     * according to [W3C standards](http://www.w3.org/TR/dom/#event).
     *
     * @class KISSY.Event.DOMEventObject
     * @extends KISSY.Event.Object
     * @param domEvent native dom event
     */
    function DOMEventObject(domEvent) {
        var self = this;

        if ('@DEBUG@') {
            /**
             * altKey
             * @property altKey
             */
            self.altKey = undefined;
            /**
             * attrChange
             * @property attrChange
             */
            self.attrChange = undefined;
            /**
             * attrName
             * @property attrName
             */
            self.attrName = undefined;
            /**
             * bubbles
             * @property bubbles
             */
            self.bubbles = undefined;
            /**
             * button
             * @property button
             */
            self.button = undefined;
            /**
             * cancelable
             * @property cancelable
             */
            self.cancelable = undefined;
            /**
             * charCode
             * @property charCode
             */
            self.charCode = undefined;
            /**
             * clientX
             * @property clientX
             */
            self.clientX = undefined;
            /**
             * clientY
             * @property clientY
             */
            self.clientY = undefined;
            /**
             * ctrlKey
             * @property ctrlKey
             */
            self.ctrlKey = undefined;
            /**
             * data
             * @property data
             */
            self.data = undefined;
            /**
             * detail
             * @property detail
             */
            self.detail = undefined;
            /**
             * eventPhase
             * @property eventPhase
             */
            self.eventPhase = undefined;
            /**
             * fromElement
             * @property fromElement
             */
            self.fromElement = undefined;
            /**
             * handler
             * @property handler
             */
            self.handler = undefined;
            /**
             * keyCode
             * @property keyCode
             */
            self.keyCode = undefined;
            /**
             * metaKey
             * @property metaKey
             */
            self.metaKey = undefined;
            /**
             * newValue
             * @property newValue
             */
            self.newValue = undefined;
            /**
             * offsetX
             * @property offsetX
             */
            self.offsetX = undefined;
            /**
             * offsetY
             * @property offsetY
             */
            self.offsetY = undefined;
            /**
             * pageX
             * @property pageX
             */
            self.pageX = undefined;
            /**
             * pageY
             * @property pageY
             */
            self.pageY = undefined;
            /**
             * prevValue
             * @property prevValue
             */
            self.prevValue = undefined;
            /**
             * relatedNode
             * @property relatedNode
             */
            self.relatedNode = undefined;
            /**
             * relatedTarget
             * @property relatedTarget
             */
            self.relatedTarget = undefined;
            /**
             * screenX
             * @property screenX
             */
            self.screenX = undefined;
            /**
             * screenY
             * @property screenY
             */
            self.screenY = undefined;
            /**
             * shiftKey
             * @property shiftKey
             */
            self.shiftKey = undefined;
            /**
             * srcElement
             * @property srcElement
             */
            self.srcElement = undefined;

            /**
             * toElement
             * @property toElement
             */
            self.toElement = undefined;
            /**
             * view
             * @property view
             */
            self.view = undefined;
            /**
             * wheelDelta
             * @property wheelDelta
             */
            self.wheelDelta = undefined;
            /**
             * which
             * @property which
             */
            self.which = undefined;
            /**
             * changedTouches
             * @property changedTouches
             */
            self.changedTouches = undefined;
            /**
             * touches
             * @property touches
             */
            self.touches = undefined;
            /**
             * targetTouches
             * @property targetTouches
             */
            self.targetTouches = undefined;
            /**
             * rotation
             * @property rotation
             */
            self.rotation = undefined;
            /**
             * scale
             * @property scale
             */
            self.scale = undefined;
        }

        DOMEventObject.superclass.constructor.call(self);
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
         * @property target
         * @type {HTMLElement}
         */
        /**
         * current htm node which processes current event
         * @property currentTarget
         * @type {HTMLElement}
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

        // ie/webkit
        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }

        // gecko
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

        // 默认 deltaY (ie)
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        if (deltaX !== undefined ||
            deltaY !== undefined ||
            delta !== undefined) {
            S.mix(e, {
                /**
                 * deltaY of mousewheel event
                 * @property deltaY
                 */
                deltaY: deltaY,
                /**
                 * delta of mousewheel event
                 * @property delta
                 */
                delta: delta,
                /**
                 * deltaX of mousewheel event
                 * @property deltaX
                 */
                deltaX: deltaX
            });
        }
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

    // compatibility
    // Event.Object = S.EventObject = DOMEventObject;

    Event.DOMEventObject=DOMEventObject;

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
     * @private
     * @class KISSY.Event.ObservableDOMEvent
     * @extends KISSY.Event.ObservableEvent
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
            if (!s.setup || s.setup.call(currentTarget, type) === false) {
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
                // http://www.w3.org/TR/dom/#dispatching-events
                // Let listeners be a static list of the event listeners
                // associated with the object for which these steps are run.
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
                win = DOM.getWindow(cur.ownerDocument || cur),
                curDocument = win.document,
                eventPath = [],
                eventPathIndex = 0,
                ontype = 'on' + eventType;


            // http://www.w3.org/TR/dom/#dispatching-events
            // let event path be a static ordered list of all its ancestors in tree order,
            // or let event path be the empty list otherwise.
            do {
                eventPath.push(cur);
                // Bubble up to document, then to window
                cur = cur.parentNode ||
                    cur.ownerDocument ||
                    (cur === curDocument) && win;
            } while (cur);

            cur = eventPath[eventPathIndex];

            // bubble up dom tree
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

                cur = eventPath[++eventPathIndex];
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
                    if ((!s['tearDown'] || s['tearDown'].call(currentTarget, type) === false)) {
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
     * @private
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
 *  special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/special', function () {
    return {};
});/**
 * @ignore
 *  utils for event
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
 *  inspired by yui3
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
            // allow delegate
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
