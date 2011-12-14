/**
 * scalable event framework for kissy (refer DOM3 Events)
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('event/base', function (S, DOM, EventObject, Utils, handle) {

    var isValidTarget = Utils.isValidTarget,
        splitAndRun = Utils.splitAndRun,
        nodeName = DOM._nodeName,
        trim = S.trim,
        TRIGGERED_NONE = Utils.TRIGGERED_NONE;

    /**
     * @name KISSY.Event
     */
    var Event = {

        // such as: { 'mouseenter' : { setup:fn ,tearDown:fn} }
        special:{},

        /**
         * fire event,simulate bubble in browser.
         * similar to dispatchEvent in DOM3 Events
         * @returns {boolean} The return value of fire/dispatchEvent indicates
         *                 whether any of the listeners which handled the event called preventDefault.
         *                 If preventDefault was called the value is false, else the value is true.
         */
        fire:function (targets, eventType, eventData, onlyHandlers/*internal usage*/) {
            var ret = true;
            // custom event firing moved to target.js
            eventData = eventData || {};
            if (S.isString(eventType)) {
                eventType = trim(eventType);
                if (eventType.indexOf(" ") > -1) {
                    splitAndRun(eventType, function (t) {
                        ret = Event.fire(targets, t, eventData, onlyHandlers) && ret;
                    });
                    return ret;
                }
                // protect event type
                eventData.type = eventType;
            } else if (eventType instanceof EventObject) {
                eventData = eventType;
                eventType = eventData.type;
            }
            DOM.query(targets).each(function (target) {
                ret = fireDOMEvent(target, eventType, eventData, onlyHandlers) && ret;
            });
            return ret;
        },

        /**
         * does not cause default behavior to occur
         * does not bubble up the DOM hierarchy
         * @param targets
         * @param {KISSY.Event.Object | String} eventType
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
        do {
            event.currentTarget = cur;
            handle(cur, event);
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
        } else {
            ret = false;
        }
        return ret;
    }

    return Event;
}, {
    requires:["dom", "./object", "./utils",'./handle']
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
