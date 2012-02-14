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
});