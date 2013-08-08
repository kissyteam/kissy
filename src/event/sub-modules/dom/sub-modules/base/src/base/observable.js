/**
 * @ignore
 * custom event for dom.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/observable', function (S, Dom, Special, DomEventUtils,
                                                 DomEventObserver, DomEventObject, BaseEvent) {

    // 记录手工 fire(domElement,type) 时的 type
    // 再在浏览器通知的系统 eventHandler 中检查
    // 如果相同，那么证明已经 fire 过了，不要再次触发了
    var BaseUtils = BaseEvent.Utils;

    /**
     * custom event for dom
     * @param {Object} cfg
     * @private
     * @class KISSY.Event.DomEventObservable
     * @extends KISSY.Event.Observable
     */
    function DomEventObservable(cfg) {
        var self = this;
        S.mix(self, cfg);
        self.reset();
        /**
         * html node which binds current custom event
         * @cfg {HTMLElement} currentTarget
         */
    }

    S.extend(DomEventObservable, BaseEvent.Observable, {

        setup: function () {
            var self = this,
                type = self.type,
                s = Special[type] || {},
                currentTarget = self.currentTarget,
                eventDesc = DomEventUtils.data(currentTarget),
                handle = eventDesc.handle;
            // 第一次注册该事件，dom 节点才需要注册 dom 事件
            if (!s.setup || s.setup.call(currentTarget, type) === false) {
                DomEventUtils.simpleAdd(currentTarget, type, handle)
            }
        },

        constructor: DomEventObservable,

        reset: function () {
            var self = this;
            DomEventObservable.superclass.reset.call(self);
            self.delegateCount = 0;
            self.lastCount = 0;
        },

        /**
         * notify current event 's observers
         * @param {KISSY.Event.DomEventObject} event
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
             Dom3 Events: EventListenerList objects in the Dom are live. ??
             */
            var target = event.target,
                eventType = event['type'],
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
            if (delegateCount && target.nodeType) {
                while (target != currentTarget) {
                    if (target.disabled !== true || eventType !== "click") {
                        var cachedMatch = {},
                            matched, key, filter;
                        currentTargetObservers = [];
                        for (i = 0; i < delegateCount; i++) {
                            observer = observers[i];
                            filter = observer.filter;
                            key = filter + '';
                            matched = cachedMatch[key];
                            if (matched === undefined) {
                                matched = cachedMatch[key] = Dom.test(target, filter);
                            }
                            if (matched) {
                                currentTargetObservers.push(observer);
                            }
                        }
                        if (currentTargetObservers.length) {
                            allObservers.push({
                                currentTarget: target,
                                'currentTargetObservers': currentTargetObservers
                            });
                        }
                    }
                    target = target.parentNode || currentTarget;
                }
            }

            // root node's observers is placed at end position of add observers
            // in case child node stopPropagation of root node's observers
            if (delegateCount < observers.length) {
                allObservers.push({
                    currentTarget: currentTarget,
                    // http://www.w3.org/TR/dom/#dispatching-events
                    // Let listeners be a static list of the event listeners
                    // associated with the object for which these steps are run.
                    currentTargetObservers: observers.slice(delegateCount)
                });
            }

            //noinspection JSUnresolvedFunction
            for (i = 0, len = allObservers.length; !event.isPropagationStopped() && i < len; ++i) {

                observerObj = allObservers[i];
                currentTargetObservers = observerObj.currentTargetObservers;
                currentTarget0 = observerObj.currentTarget;
                event.currentTarget = currentTarget0;

                //noinspection JSUnresolvedFunction
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
         * fire dom event from bottom to up , emulate dispatchEvent in Dom3 Events
         * @param {Object|KISSY.Event.DomEventObject} [event] additional event data
         * @param {Boolean} [onlyHandlers] for internal usage
         */
        fire: function (event, onlyHandlers/*internal usage*/) {

            event = event || {};

            var self = this,
                eventType = String(self.type),
                domEventObservable,
                eventData,
                specialEvent = Special[eventType] || {},
                bubbles = specialEvent.bubbles !== false,
                currentTarget = self.currentTarget;

            // special fire for click/focus/blur
            if (specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false) {
                return;
            }

            if (!(event instanceof DomEventObject)) {
                eventData = event;
                event = new DomEventObject({
                    currentTarget: currentTarget,
                    type: eventType,
                    target: currentTarget
                });
                S.mix(event, eventData);
            }

            if (specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false) {
                return;
            }

            // onlyHandlers is equal to event.halt()
            // but we can not call event.halt()
            // because handle will check event.isPropagationStopped
            var cur = currentTarget,
                win = Dom.getWindow(cur),
                curDocument = win.document,
                eventPath = [],
                ontype = 'on' + eventType,
                eventPathIndex = 0;

            // http://www.w3.org/TR/dom/#dispatching-events
            // let event path be a static ordered list of all its ancestors in tree order,
            // or let event path be the empty list otherwise.
            do {
                eventPath.push(cur);
                // Bubble up to document, then to window
                cur = cur.parentNode || cur.ownerDocument || (cur === curDocument) && win;
            } while (!onlyHandlers && cur && bubbles);

            cur = eventPath[eventPathIndex];

            // bubble up dom tree
            do {
                event['currentTarget'] = cur;
                domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
                // default bubble for html node
                if (domEventObservable) {
                    domEventObservable.notify(event);
                }
                // Trigger an inline bound script
                if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                    event.preventDefault();
                }
                cur = eventPath[++eventPathIndex];
            } while (!onlyHandlers && cur && !event.isPropagationStopped());

            if (!onlyHandlers && !event.isDefaultPrevented()) {
                // now all browser support click
                // https://developer.mozilla.org/en-US/docs/Dom/element.click
                try {
                    // execute default action on dom node
                    // exclude window
                    if (currentTarget[ eventType ] && !S.isWindow(currentTarget)) {
                        // 记录当前 trigger 触发
                        DomEventObservable.triggeredEvent = eventType;

                        // 只触发默认事件，而不要执行绑定的用户回调
                        // 同步触发
                        currentTarget[ eventType ]();
                    }
                } catch (eError) {
                    S.log('trigger action error: ');
                    S.log(eError);
                }

                DomEventObservable.triggeredEvent = '';
            }

        },

        /**
         * add a observer to custom event's observers
         * @param {Object} cfg {@link KISSY.Event.DomEventObserver} 's config
         */
        on: function (cfg) {
            var self = this,
                observers = self.observers,
                s = Special[self.type] || {},
            // clone event
                observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);

            if (S.Config.debug) {
                if (!observer.fn) {
                    S.error('lack event handler for ' + self.type);
                }
            }

            if (self.findObserver(/**@type KISSY.Event.DomEventObserver*/observer) == -1) {
                // 增加 listener
                if (observer.filter) {
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
         * @param {Object} cfg {@link KISSY.Event.DomEventObserver} 's config
         */
        detach: function (cfg) {
            var groupsRe,
                self = this,
                s = Special[self.type] || {},
                hasFilter = 'filter' in cfg,
                filter = cfg.filter,
                context = cfg.context,
                fn = cfg.fn,
                currentTarget = self.currentTarget,
                observers = self.observers,
                groups = cfg.groups;

            if (!observers.length) {
                return;
            }

            if (groups) {
                groupsRe = BaseUtils.getGroupsRe(groups);
            }

            var i, j, t, observer, observerContext, len = observers.length;

            // 移除 fn
            if (fn || hasFilter || groupsRe) {
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
                                hasFilter &&
                                    (
                                        (filter && filter != observer.filter) ||
                                            (!filter && !observer.filter)
                                        )
                                ) ||

                            // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                            (groupsRe && !observer.groups.match(groupsRe))
                        ) {
                        t[j++] = observer;
                    } else {
                        if (observer.filter && self.delegateCount) {
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
                domEventObservables,
                handle,
                s = Special[type] || {},
                currentTarget = self.currentTarget,
                eventDesc = DomEventUtils.data(currentTarget);
            if (eventDesc) {
                domEventObservables = eventDesc.observables;
                if (!self.hasObserver()) {
                    handle = eventDesc.handle;
                    // remove(el, type) or fn 已移除光
                    // dom node need to detach handler from dom node
                    if ((!s['tearDown'] || s['tearDown'].call(currentTarget, type) === false)) {
                        DomEventUtils.simpleRemove(currentTarget, type, handle);
                    }
                    // remove currentTarget's single event description
                    delete domEventObservables[type];
                }

                // remove currentTarget's  all domEventObservables description
                if (S.isEmptyObject(domEventObservables)) {
                    eventDesc.handle = null;
                    DomEventUtils.removeData(currentTarget);
                }
            }
        }
    });

    DomEventObservable.triggeredEvent = '';

    /**
     * get custom event from html node by event type.
     * @param {HTMLElement} node
     * @param {String} type event type
     * @return {KISSY.Event.DomEventObservable}
     */
    DomEventObservable.getDomEventObservable = function (node, type) {

        var domEventObservablesHolder = DomEventUtils.data(node),
            domEventObservables;
        if (domEventObservablesHolder) {
            domEventObservables = domEventObservablesHolder.observables;
        }
        if (domEventObservables) {
            return domEventObservables[type];
        }

        return null;
    };


    DomEventObservable.getDomEventObservablesHolder = function (node, create) {
        var domEventObservables = DomEventUtils.data(node);
        if (!domEventObservables && create) {
            DomEventUtils.data(node, domEventObservables = {});
        }
        return domEventObservables;
    };

    return DomEventObservable;

}, {
    requires: ['dom', './special', './utils', './observer', './object', 'event/base']
});