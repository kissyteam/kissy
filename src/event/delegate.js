/**
 * kissy delegate for event module
 * @author yiminghe@gmail.com
 */
KISSY.add("event/delegate", function(S, DOM, Event) {
    var batchForType = Event._batchForType,
        delegateMap = {
            focus:"focusin",
            blur:"focusout"
        };

    S.mix(Event, {
            delegate:function(targets, type, selector, fn, scope) {
                if (batchForType('delegate', targets, type, selector, fn, scope)) {
                    return targets;
                }
                DOM.query(targets).each(function(target) {
                    // 自定义事件 delegate 无意义
                    if (target.isCustomEventTarget) {
                        return;
                    }
                    type = delegateMap[type] || type;
                    Event.on(target, type, delegateHandler, target, {
                            fn:fn,
                            selector:selector,
                            // type:type,
                            scope:scope,
                            equals:equals
                        });
                });
                return targets;
            },

            undelegate:function(targets, type, selector, fn, scope) {
                if (batchForType('undelegate', targets, type, selector, fn, scope)) {
                    return targets;
                }
                DOM.query(targets).each(function(target) {
                    // 自定义事件 delegate 无意义
                    if (target.isCustomEventTarget) {
                        return;
                    }
                    type = delegateMap[type] || type;
                    Event.remove(target, type, delegateHandler, target, {
                            fn:fn,
                            selector:selector,
                            // type:type,
                            scope:scope,
                            equals:equals
                        });
                });
                return targets;
            }
        });

    // 比较函数，两个 delegate 描述对象比较
    function equals(d) {
        if (d.fn === undefined && d.selector === undefined) {
            return true;
        } else if (d.fn === undefined) {
            return this.selector == d.selector;
        } else {
            return this.fn == d.fn && this.selector == d.selector && this.scope == d.scope;
        }
    }

    function eq(d1, d2) {
        return (d1 == d2 || (!d1 && d2) || (!d1 && d2));
    }

    // 根据 selector ，从事件源得到对应节点
    function delegateHandler(event, data) {
        var delegateTarget = this,
            gret,
            target = event.target,
            invokeds = DOM.closest(target, [data.selector], delegateTarget);
        // 找到了符合 selector 的元素，可能并不是事件源
        if (invokeds) {
            for (var i = 0; i < invokeds.length; i++) {
                event.currentTarget = invokeds[i];
                var ret = data.fn.call(data.scope || delegateTarget, event);
                if (ret === false ||
                    event.isPropagationStopped ||
                    event.isImmediatePropagationStopped) {
                    if (ret === false) {
                        gret = ret;
                    }
                    if (event.isPropagationStopped ||
                        event.isImmediatePropagationStopped) {
                        break;
                    }
                }
            }
        }
        return gret;
    }

    return Event;
}, {
        requires:["dom","./base"]
    });

/**
 * focusin/out 的特殊之处 , delegate 只能在容器上注册 focusin/out ，
 * 1.其实非 ie 都是注册 focus capture=true，然后注册到 focusin 对应 handlers
 *   1.1 当 Event.fire("focus")，没有 focus 对应的 handlers 数组，然后调用元素 focus 方法，
 *   focusin.js 调用 Event.fire("focusin") 进而执行 focusin 对应的 handlers 数组
 *   1.2 当调用 Event.fire("focusin")，直接执行 focusin 对应的 handlers 数组，但不会真正聚焦
 *
 * 2.ie 直接注册 focusin , focusin handlers 也有对应用户回调
 *   2.1 当 Event.fire("focus") , 同 1.1
 *   2.2 当 Event.fire("focusin"),直接执行 focusin 对应的 handlers 数组，但不会真正聚焦
 *
 * TODO:
 * mouseenter/leave delegate??
 *
 **/