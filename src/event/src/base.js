/**
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
                        data:handler.data,
                        fn:handler.fn,
                        groups:handler.groups,
                        last:handler.last,
                        originalType:handler.originalType,
                        scope:handler.scope,
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
