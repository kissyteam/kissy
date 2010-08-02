/**
 * Switchable Countdown Plugin
 * @creator gonghao<gonghao@ghsky.com>
 */
KISSY.add('switchable-countdown', function(S, undefined) {

    var Event = S.Event, DOM = S.DOM, Anim = S.Anim,
        Switchable = S.Switchable,
        CLS_PREFIX = 'ks-switchable-', DOT = '.',
        // 倒计时基底层、遮盖层、内容层样式
        BASE_CLS = CLS_PREFIX + 'nav-base', COVER_CLS = CLS_PREFIX + 'nav-cover',
        NUM_CLS = CLS_PREFIX + 'nav-num';

    /**
     * 添加默认配置
     * @member countdown
     * @member countdownStyle
     */
    S.mix(Switchable.Config, {
        countdown: false,
        countdownStyle: 'height:0px'
    });

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name: 'countdown',

        init: function(host) {
            var cfg = host.config, interval = cfg.interval, pauseOnHover = cfg.pauseOnHover,
                triggers = host.triggers, covers = [], style = cfg.countdownStyle, animControl;
                
            // 必须保证开启autoplay以及有trigger时，才能开启倒计时动画
            if (!cfg.countdown || !cfg.autoplay || !cfg.hasTriggers) return;
            
            // 为每个trigger增加倒计时动画相关层
            S.each(triggers, function(trigger, i) {
                var base = DOM.create('<div class="' + BASE_CLS + '">'),
                    cover = DOM.create('<div class="' + COVER_CLS + '">'),
                    num = DOM.create('<div class="' + NUM_CLS + '">');
                num.innerHTML = i + 1;
                trigger.innerHTML = '';
                trigger.appendChild(base);
                trigger.appendChild(cover);
                trigger.appendChild(num);
                covers.push(cover);
            });
            
            // 必须保证每个trigger都有一个倒计时遮盖层
            if (triggers.length !== covers.length) return;    
            
            // 鼠标悬停，停止自动播放
            if (pauseOnHover) {
                Event.on(host.container, 'mouseenter', function() {
                    // 鼠标悬停时，动画效果自动失效
                    closeAnim();
                });
            }
            
            
            // panels切换前，当前trigger完成善后工作以及下一trigger进行初始化
            host.on('beforeSwitch', function(e) {
                // 完成切换前的清理工作
                restoreCover();
                
                // 只在当用户以非主动方式触发triggers产生切换时才初始化动画设置
                if (!host.paused) {
                    DOM.css(covers[e.toIndex], 'visibility', 'visible');
                }
            });
            
            // panels切换时开始倒计时动画
            host.on('switch', function(e) {
                // 如果悬停关闭动画，且在悬停时产生了panel切换，即用户主动触发triggers产生切换
                // 只在当用户以非主动方式触发triggers产生切换时才使用动画
                if (!host.paused) {
                    // 开始新一轮动画
                    createAnim();
                }
            });
            
            // 初始化倒计时覆盖层样式
            DOM.css(covers[0], 'visibility', 'visible');
            
            // 第一次开始，包括自动切换和动画效果
            createAnim();
            
            // 恢复遮盖层初始设置
            function restoreCover(index) {
                index = index || host.activeIndex;
                var cover = covers[index];
                
                // 恢复前，先结束未完成动画效果
                stopAinm();
                
                // 恢复动画前状态
                DOM.css(cover, 'visibility', 'hidden');
                DOM.removeAttr(cover, 'style');
            }
            
            // 创建倒计时动画计时器
            function createAnim(index) {
                index = index || host.activeIndex;
                (animControl = new Anim(covers[index], style, interval, 'easeNone')).run();
            }
            
            // 平滑关闭当前未完成动画效果
            function closeAnim() {
                // 先清理未完成动画
                stopAinm();
                // 动画恢复之前状态
                (animControl = new Anim(covers[host.activeIndex], style, interval / 10, 'easeOut')).run();
            }
            
            // 清理所有动画
            function stopAinm() {
                if (animControl) {
                    animControl.stop();
                    animControl = undefined;
                }
            }
        }
    });
});