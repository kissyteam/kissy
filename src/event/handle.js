/**
 * @fileOverview responsible for handling event from browser to KISSY Event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/handle", function (S, DOM, _protected) {

    function getEvents(target) {
        // 获取事件描述
        var eventDesc = _protected._data(target);
        return eventDesc && eventDesc.events;
    }

    function getHandlers(target, type) {
        var events = getEvents(target) || {};
        return events[type] || [];
    }

    return function (currentTarget, event) {
        /* As some listeners may remove themselves from the
         event, the original array length is dynamic. So,
         let's make a copy of all listeners, so we are
         sure we'll call all of them.*/
        /**
         * DOM3 Events: EventListenerList objects in the DOM are live. ??
         */
        var handlers = getHandlers(currentTarget, event.type).slice(0),
            target = event.target,
            currentTarget0,
            allHandlers = [],
            ret,
            gRet,
            handlerObj,
            i,
            j,
            delegateCount = handlers.delegateCount,
            len,
            currentTargetHandlers,
            currentTargetHandler,
            handler;

        // collect delegated handlers and corresponding element
        if (delegateCount &&
            // by jq
            // Avoid disabled elements in IE (#6911)
            // non-left-click bubbling in Firefox (#3861),firefox 8 fix it
            !target.disabled) {
            while (target != currentTarget) {
                currentTargetHandlers = [];
                for (i = 0; i < delegateCount; i++) {
                    handler = handlers[i];
                    if (DOM.test(target, handler.selector)) {
                        currentTargetHandlers.push(handler);
                    }
                }
                if (currentTargetHandlers.length) {
                    allHandlers.push({
                        currentTarget:target,
                        currentTargetHandlers:currentTargetHandlers
                    });
                }
                target = target.parentNode || currentTarget;
            }
        }

        // root node's handlers is placed at end position of add handlers
        // in case child node stopPropagation of root node's handlers
        allHandlers.push({
            currentTarget:currentTarget,
            currentTargetHandlers:handlers.slice(delegateCount)
        });

        for (i = 0, len = allHandlers.length;
             !event.isPropagationStopped && i < len;
             ++i) {

            handlerObj = allHandlers[i];
            currentTargetHandlers = handlerObj.currentTargetHandlers;
            currentTarget0 = handlerObj.currentTarget;
            event.currentTarget = currentTarget0;
            for (j = 0; !event.isImmediatePropagationStopped && j < currentTargetHandlers.length; j++) {
                currentTargetHandler = currentTargetHandlers[j];
                event.data = currentTargetHandler.data;
                // scope undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
                ret = currentTargetHandler.fn.call(
                    currentTargetHandler.scope || currentTarget,
                    event
                );
                // 和 jQuery 逻辑保持一致
                if (ret !== undefined) {
                    // 有一个 false，最终结果就是 false
                    // 否则等于最后一个返回值
                    if (gRet !== false) {
                        gRet = ret;
                    }
                    // return false 等价 preventDefault + stopProgation
                    if (ret === false) {
                        event.halt();
                    }
                }

            }
        }

        // fire 时判断如果 preventDefault，则返回 false 否则返回 true
        // 这里返回值意义不同
        return gRet;
    }
}, {
    requires:['dom', './protected']
});