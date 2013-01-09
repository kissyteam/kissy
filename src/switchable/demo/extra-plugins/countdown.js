/**
 *  Switchable Countdown Plugin
 * @author  gonghao<gonghao@ghsky.com>
 */
KISSY.add('switchable-ext/countdown', function (S, DOM, Event, Anim, Switchable, undefined) {

    var CLS_PREFIX = 'ks-switchable-trigger-',
        TRIGGER_MASK_CLS = CLS_PREFIX + 'mask',
        TRIGGER_CONTENT_CLS = CLS_PREFIX + 'content',
        STYLE = 'style';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        countdown:false,
        countdownFromStyle:'', // 倒计时的初始样式
        countdownToStyle:'width: 0' // 初始样式由用户在 css 里指定，配置里仅需要传入有变化的最终样式
    });

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name:'countdown',

        init:function (host) {
            var cfg = host.config,
                animTimer,
                interval = cfg.interval,
                triggers = host.triggers,
                masks = [],
                fromStyle = cfg.countdownFromStyle,
                toStyle = cfg.countdownToStyle,
                anim;

            // 必须保证开启 autoplay 以及有 trigger 时，才能开启倒计时动画
            if (!cfg.autoplay || !cfg.hasTriggers || !cfg.countdown) return;

            // 为每个 trigger 增加倒计时动画覆盖层
            S.each(triggers, function (trigger, i) {
                trigger.innerHTML = '<div class="' + TRIGGER_MASK_CLS + '"></div>' +
                    '<div class="' + TRIGGER_CONTENT_CLS + '">' +
                    trigger.innerHTML + '</div>';
                masks[i] = trigger.firstChild;
            });

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', function () {
                    // 先停止未完成动画
                    stopAnim();

                    // 快速平滑回退到初始状态
                    var mask = masks[host.activeIndex];
                    if (fromStyle) {
                        anim = new Anim(mask, fromStyle, .2, 'easeOut').run();
                    } else {
                        DOM.attr(mask, STYLE, "");
                    }
                });

                Event.on(host.container, 'mouseleave', function () {
                    // 鼠标离开时立即停止未完成动画
                    stopAnim();
                    var index = host.activeIndex;

                    // 初始化动画参数，准备开始新一轮动画
                    // 设置初始样式
                    DOM.attr(masks[index], STYLE, fromStyle);

                    // 重新开始倒计时动画，缓冲下，避免快速滑动
                    animTimer = setTimeout(function () {
                        startAnim(index);
                    }, 200);
                });
            }

            // panels 切换前，当前 trigger 完成善后工作以及下一 trigger 进行初始化
            host.on('beforeSwitch', function () {
                // 恢复前，先结束未完成动画效果
                stopAnim();

                // 将当前 mask 恢复动画前状态
                if (masks[host.activeIndex]) {
                    DOM.attr(masks[host.activeIndex], STYLE, fromStyle || "");
                }
            });

            // panel 切换完成时，开始 trigger 的倒计时动画
            host.on('switch', function (ev) {
                // 悬停状态，当用户主动触发切换时，不需要倒计时动画
                if (!host.paused) {
                    startAnim(ev.currentIndex);
                }
            });

            // 开始倒计时动画
            function startAnim(index) {
                stopAnim(); // 开始之前，先确保停止掉之前的
                anim = new Anim(masks[index],
                    toStyle, interval - 1).run(); // -1 是为了动画结束时停留一下，使得动画更自然
            }

            // 停止所有动画
            function stopAnim() {
                if (animTimer) {
                    clearTimeout(animTimer);
                    animTimer = null;
                }
                if (anim) {
                    anim.stop();
                    anim = undefined;
                }
            }

            /**
             * 开始第一个倒计时
             */
            if (host.activeIndex > -1) {
                startAnim(host.activeIndex);
            }


        }
    });

    return Switchable;

}, { requires:["dom", "event", "anim", "switchable"]});
/**
 * yiminghe@gmail.com：2011.06.02 review switchable
 */
