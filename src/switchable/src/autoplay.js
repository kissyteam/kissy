/**
 *  Switchable autoplay Plugin
 */
KISSY.add('switchable/autoplay', function (S, DOM, Event, Switchable, undefined) {
    var DURATION = 200,
        win = S.Env.host,
        checkElemInViewport = function (elem) {
            // 只计算上下位置是否在可视区域, 不计算左右
            var scrollTop = DOM.scrollTop(),
                vh = DOM.viewportHeight(),
                elemOffset = DOM.offset(elem),
                elemHeight = DOM.height(elem);
            return elemOffset.top > scrollTop &&
                elemOffset.top + elemHeight < scrollTop + vh;
        };

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        // 当 Switchable 对象不在可视区域中时停止动画切换
        pauseOnScroll:false,
        autoplay:false,
        interval:5, // 自动播放间隔时间
        pauseOnHover:true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });


    /**
     * 添加插件
     * attached members:
     *   - this.paused
     */
    Switchable.addPlugin({

        name:'autoplay',

        init:function (host) {

            var cfg = host.config,
                interval = cfg.interval * 1000,
                timer;

            if (!cfg.autoplay) {
                return;
            }

            if (cfg.pauseOnScroll) {
                host.__scrollDetect = S.buffer(function () {
                    // 依次检查页面上所有 switchable 对象是否在可视区域内
                    host[checkElemInViewport(host.container) ? 'start' : 'stop']();
                }, DURATION);
                Event.on(win, "scroll", host.__scrollDetect);
            }

            function startAutoplay() {
                // 设置自动播放
                timer = S.later(function () {
                    if (host.paused) {
                        return;
                    }
                    // 自动播放默认 forward（不提供配置），这样可以保证 circular 在临界点正确切换
                    // 用户 mouseenter 不提供 forward ，全景滚动
                    host.next();
                }, interval, true);
            }

            // go
            startAutoplay();

            // 添加 stop 方法，使得外部可以停止自动播放
            host.stop = function () {

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                // paused 可以让外部知道 autoplay 的当前状态
                host.paused = true;
            };

            host.start = function () {

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                host.paused = false;
                startAutoplay();
            };

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', host.stop, host);
                Event.on(host.container, 'mouseleave', host.start, host);
            }
        },

        destroy:function (host) {
            if (host.__scrollDetect) {
                Event.remove(win, "scroll", host.__scrollDetect);
                host.__scrollDetect.stop();
            }
        }
    });
    return Switchable;
}, { requires:["dom", "event", "./base"]});
/**
 * - 乔花 yiminghe@gmail.com：2012.02.08 support pauseOnScroll
 *  当 Switchable 对象不在可视区域中时停止动画切换
 *
 * - yiminghe@gmail.com：2011.06.02 review switchable
 */
