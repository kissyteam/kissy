/**
 * @fileOverview   event-mouseenter
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/mouseenter', function (S, Event, DOM, UA, special) {
    S.each([
        { name:'mouseenter', fix:'mouseover' },
        { name:'mouseleave', fix:'mouseout' }
    ], function (o) {
        special[o.name] = {
            // fix #75
            onFix:o.fix,
            // all browser need
            delegateFix:o.fix,
            handle:function (event, handler, data) {
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
                    event.stopPropagation();
                    return [handler.fn.call(handler.scope || currentTarget, event, data)];
                }
                return [];
            }
        };
    });

    return Event;
}, {
    requires:["./base", "dom", "ua", "./special"]
});

/**
 * yiminghe@gmail.com:2011-12-15
 * - 借鉴 jq 1.7 新的架构
 *
 * 承玉：2011-06-07
 * - 根据新结构，调整 mouseenter 兼容处理
 * - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 */
