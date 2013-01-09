/**
 * @ignore
 *  event-focusin
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/focusin', function (S, Event) {

    var special = Event._Special;

    // 让非 IE 浏览器支持 focusin/focusout

    S.each([
        { name: 'focusin', fix: 'focus' },
        { name: 'focusout', fix: 'blur' }
    ], function (o) {
        var key = S.guid('attaches_' + S.now() + '_');
        special[o.name] = {
            // 统一在 document 上 capture focus/blur 事件，然后模拟冒泡 fire 出来
            // 达到和 focusin 一样的效果 focusin -> focus
            // refer: http://yiminghe.iteye.com/blog/813255
            setup: function () {
                // this maybe document
                var doc = this.ownerDocument || this;
                if (!(key in doc)) {
                    doc[key] = 0;
                }
                doc[key] += 1;
                if (doc[key] === 1) {
                    doc.addEventListener(o.fix, handler, true);
                }
            },

            tearDown: function () {
                var doc = this.ownerDocument || this;
                doc[key] -= 1;
                if (doc[key] === 0) {
                    doc.removeEventListener(o.fix, handler, true);
                }
            }
        };

        function handler(event) {
            var target = event.target;
            return Event.fire(target, o.name);
        }

    });

    return Event;
}, {
    requires: ['event/dom/base']
});

/*
 yiminghe@gmail.com:2011-06-07
 - 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 */
