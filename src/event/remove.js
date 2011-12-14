/**
 * @fileOverview responsible for un-registering event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/remove", function (S, Event, DOM, Utils, _protected) {
    var isValidTarget = Utils.isValidTarget,
        delegateMap = Utils.delegateMap,
        isIdenticalHandler = Utils.isIdenticalHandler,
        simpleRemove = Utils.simpleRemove,
        EVENT_SPECIAL = Event.special;

    S.mix(Event, {
        // single target, single type, fixed native
        __remove:function (isNativeTarget, target, type, fn, scope) {

            if (!target || (isNativeTarget && !isValidTarget(target))) {
                return;
            }

            var data, selector;

            if (S.isObject(fn)) {
                scope = fn.scope;
                data = fn.data;
                selector = fn.selector;
                fn = fn.fn;
                if (selector) {
                    type = delegateMap[type] || type;
                }
            }

            var eventDesc = _protected._data(target),
                events = eventDesc && eventDesc.events,
                handlers,
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
                        Event.__remove(isNativeTarget, target, type);
                    }
                }
                return;
            }

            if ((handlers = events[type])) {
                len = handlers.length;
                // 移除 fn
                if (fn && len) {
                    var currentHandler = {
                        data:data,
                        selector:selector,
                        fn:fn,
                        scope:scope
                    }, handler;

                    for (i = 0, j = 0, t = []; i < len; ++i) {
                        handler = handlers[i];
                        // if supply fn then remove delegateHandler only when selector matches
                        if (!isIdenticalHandler(handler, currentHandler, target, 1)) {
                            t[j++] = handler;
                        } else {
                            if (handlers.delegateCount) {
                                handlers.delegateCount--;
                            }
                            if (special.remove) {
                                special.remove.call(target, handler);
                            }
                        }
                    }
                    events[type] = t;
                    len = t.length;
                }

                // remove(el, type) or fn 已移除光
                if (!fn || !len) {
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
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler/listener.
         * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
         */
        remove:function (targets, type, fn, scope) {

            type = S.trim(type);

            if (Utils.batchForType(Event.remove, targets, type, fn, scope)) {
                return targets;
            }

            DOM.query(targets).each(function (target) {
                Event.__remove(true, target, type, fn, scope);
            });

            return targets;

        }
    });
}, {
    requires:['./base', 'dom', './utils', './protected']
});