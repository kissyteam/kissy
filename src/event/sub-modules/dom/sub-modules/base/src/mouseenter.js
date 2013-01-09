/**
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
