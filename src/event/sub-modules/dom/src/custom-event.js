/**
 * custom event for dom.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/custom-event', function (S, DOM, special, Utils, DOMSubscriber, DOMEventObject, Event) {

    // 记录手工 fire(domElement,type) 时的 type
    // 再在浏览器通知的系统 eventHandler 中检查
    // 如果相同，那么证明已经 fire 过了，不要再次触发了
    var triggeredEvent = '',
        _Utils = Event._Utils;

    function DOMCustomEvent(cfg) {
        var self = this;
        S.mix(self, cfg);
        self.reset();
    }

    S.extend(DOMCustomEvent, Event._BaseCustomEvent, {
        constructor: DOMCustomEvent,
        reset: function () {
            var self = this;
            DOMCustomEvent.superclass.reset.call(self);
            self.delegateCount = 0;
            self.lastCount = 0;
        },
        /**
         * notify all subscribers
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
            var target = event.target,
                self = this,
                currentTarget = self.currentTarget,
                subscribers = self..subscribers,
                currentTarget0,
                allSubscribers = [],
                ret,
                gRet,
                handlerObj,
                i,
                j,
                delegateCount = subscribers.delegateCount || 0,
                len,
                currentTargetSubscribers,
                currentTargetSubscriber,
                subscriber;

            // collect delegated subscribers and corresponding element
            if (delegateCount &&
                // by jq
                // Avoid disabled elements in IE (#6911)
                // non-left-click bubbling in Firefox (#3861),firefox 8 fix it
                !target.disabled) {
                while (target != currentTarget) {
                    currentTargetSubscribers = [];
                    for (i = 0; i < delegateCount; i++) {
                        subscriber = subscribers[i];
                        if (DOM.test(target, subscriber.selector)) {
                            currentTargetSubscribers.push(subscriber);
                        }
                    }
                    if (currentTargetSubscribers.length) {
                        allSubscribers.push({
                            currentTarget: target,
                            'currentTargetSubscribers': currentTargetSubscribers
                        });
                    }
                    target = target.parentNode || currentTarget;
                }
            }

            // root node's subscribers is placed at end position of add subscribers
            // in case child node stopPropagation of root node's subscribers
            allSubscribers.push({
                currentTarget: currentTarget,
                currentTargetSubscribers: subscribers.slice(delegateCount)
            });

            for (i = 0, len = allSubscribers.length;
                 !event.isPropagationStopped() && i < len;
                 ++i) {

                handlerObj = allSubscribers[i];
                currentTargetSubscribers = handlerObj.currentTargetSubscribers;
                currentTarget0 = handlerObj.currentTarget;
                event.currentTarget = currentTarget0;

                for (j = 0;
                     !event.isImmediatePropagationStopped && j < currentTargetSubscribers.length;
                     j++) {

                    currentTargetSubscriber = currentTargetSubscribers[j];


                    ret = currentTargetSubscriber.notify(event, self);

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

        fire: function (eventData, onlyHandlers) {

            eventData = eventData || {};

            var eventType = this.type,
                s = special[eventType];

            // TODO bug: when fire mouseenter, it also fire mouseover in firefox/chrome
            if (s && s['onFix']) {
                eventType = s['onFix'];
            }

            var event,
                currentTarget = this.currentTarget,
                ret = true;
            eventData.type = eventType;

            if (eventData instanceof DOMEventObject) {
                event = eventData;
            } else {
                eventData.currentTarget = currentTarget;
                event = new DOMEventObject();
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
                t = self.notify(event);
                if (ret !== false) {
                    ret = t;
                }
                // Trigger an inline bound script
                if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                    event.preventDefault();
                }
                // Bubble up to document, then to window
                cur = cur.parentNode ||
                    cur.ownerDocument ||
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
                    if (ontype &&
                        currentTarget[ eventType ] &&
                        (
                            (eventType !== 'focus' && eventType !== 'blur') ||
                                currentTarget.offsetWidth !== 0
                            ) &&
                        !S.isWindow(currentTarget)) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = currentTarget[ ontype ];

                        if (old) {
                            currentTarget[ ontype ] = null;
                        }

                        // 记录当前 trigger 触发
                        triggeredEvent = eventType;

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

                triggeredEvent = '';

            }
            return ret;
        },

        on: function (cfg) {
            var self = this,
                subscribers = self.subscribers,
                i,
                subscriber = new DOMSubscriber(cfg);

            for (i = subscribers.length - 1; i >= 0; --i) {
                /*
                 If multiple identical EventListeners are registered on the same EventTarget
                 with the same parameters the duplicate instances are discarded.
                 They do not cause the EventListener to be called twice
                 and since they are discarded
                 they do not need to be removed with the removeEventListener method.
                 */
                if (subscriber.equals(subscribers[i])) {
                    return;
                }
            }

            // 增加 listener
            if (subscriber.selector) {
                subscribers.splice(self.delegateCount, 0, subscriber);
                self.delegateCount++;
            } else {
                if (subscriber.last) {
                    subscribers.push(subscriber);
                    self.lastCount++;
                } else {
                    subscribers.splice(subscribers.length - self.lastCount, 0, subscriber);
                }
            }

            return subscriber;
        },


        'fn': function (event) {
            // 是经过 fire 手动调用而浏览器同步触发导致的，就不要再次触发了，
            // 已经在 fire 中 bubble 过一次了
            // in case after page has unloaded
            if (triggeredEvent == event.type || typeof KISSY == 'undefined') {
                return;
            }
            var self = this;
            event.currentTarget = self.currentTarget;
            event = new DOMEventObject(event);
            return self.notify(event);
        },

        detach: function (cfg) {
            var groupsRe,
                self = this,
                hasSelector = 'selector' in self,
                selector = self.selector,
                scope = self.scope,
                currentTarget = self.currentTarget,
                subscribers = self.subscribers,
                groups = cfg.groups;

            if (!subscribers.length) {
                return;
            }

            if (groups) {
                groupsRe = _Utils.getGroupsRe(groups);
            }

            var i, j, t, subscriber, subscriberScope, len = subscribers.length;

            // 移除 fn
            if (fn || hasSelector || groupsRe) {
                scope = scope || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    subscriber = subscribers[i];
                    subscriberScope = subscriber.scope || currentTarget;
                    if (
                        (scope != subscriberScope) ||
                            // 指定了函数，函数不相等，保留
                            (fn && fn != subscriber.fn) ||
                            // 1.没指定函数
                            // 1.1 没有指定选择器,删掉 else2
                            // 1.2 指定选择器,字符串为空
                            // 1.2.1 指定选择器,字符串为空,待比较 subscriber 有选择器,删掉 else
                            // 1.2.2 指定选择器,字符串为空,待比较 subscriber 没有选择器,保留
                            // 1.3 指定选择器,字符串不为空,字符串相等,删掉 else
                            // 1.4 指定选择器,字符串不为空,字符串不相等,保留
                            // 2.指定了函数且函数相等
                            // 2.1 没有指定选择器,删掉 else
                            // 2.2 指定选择器,字符串为空
                            // 2.2.1 指定选择器,字符串为空,待比较 subscriber 有选择器,删掉 else
                            // 2.2.2 指定选择器,字符串为空,待比较 subscriber 没有选择器,保留
                            // 2.3 指定选择器,字符串不为空,字符串相等,删掉  else
                            // 2.4 指定选择器,字符串不为空,字符串不相等,保留
                            (
                                hasSelector &&
                                    (
                                        (selector && selector != subscriber.selector) ||
                                            (!selector && !subscriber.selector)
                                        )
                                ) ||

                            // 指定了删除的某些组，而该 subscriber 不属于这些组，保留，否则删除
                            (groupsRe && !subscriber.groups.match(groupsRe))
                        ) {
                        t[j++] = subscriber;
                    } else {
                        if (subscriber.selector && self.delegateCount) {
                            self.delegateCount--;
                        }
                        if (subscriber.last && self.lastCount) {
                            self.lastCount--;
                        }
                        if (special.remove) {
                            special.remove.call(currentTarget, subscriber);
                        }
                    }
                }

                self.subscribers = t;
            } else {
                // 全部删除
                self.reset();
            }
        }
    });

    return DOMCustomEvent;

}, {
    requires: ['dom', './special', './utils', './subscriber', 'event-object', 'event/base']
});