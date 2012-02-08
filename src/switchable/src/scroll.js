/**
 * @fileOverview Switchable Scroll Manager Plugin
 * @creator  shengyan1985@gmail.com
 * 当 Switchable 对象不在可视区域中时停止动画切换
 */
KISSY.add('switchable/scroll', function(S, Node, DOM, Event, Switchable, undefined) {
    // 用于储存当前页面上已经初始化了的 Switchable 对象
    var $ = Node.all,
        win = $(window),
        SwitchObj = {},
        DURATION = 200,
        checkElemInViewport = function(elem) {
            // 只计算上下位置是否在可视区域, 不计算左右
            var scrollTop = DOM.scrollTop(),
                vh = DOM.viewportHeight(),
                elemOffset = DOM.offset(elem),
                elemHeight = DOM.height(elem);

            return elemOffset.top>scrollTop && elemOffset.top + elemHeight < scrollTop + vh;

        },
        scrollDetect = S.buffer(function() {
            // 依次检查页面上所有 switchable 对象是否在可视区域内
            S.each(SwitchObj, function(v, k) {
                v[checkElemInViewport(v.container)?'start':'stop']();
            });
        }, DURATION);
    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        pauseOnScroll: true
    });

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name: 'scroll',

        init: function(host) {
            var cfg = host.config;
            if (!cfg.pauseOnScroll || !cfg.autoplay) return;

            var sid = S.guid();
            SwitchObj[sid] = host;
            host._id = sid;
            var length = 0;
            S.each(SwitchObj, function(v) {
                length++
            });
            // 第一次添加对象后, 绑定 window 的 scroll 事件
            length === 1 && win.on('scroll', scrollDetect);
        },

        destroy: function(host) {
            var cfg = host.config;
            if (!cfg.pauseOnScroll || !cfg.autoplay) return;

            delete SwitchObj[host._id];
            S.isEmptyObject(SwitchObj) && win.detach('scroll', scrollDetect);
        }
    });
    return Switchable;
}, { requires:["node", "dom", "event","./base"]});


/***
 * note: 要不要和 autoplay.js 合并?
 */
