/**
 *  Switchable Effect Plugin
 */
KISSY.add('switchable/effect', function (S, DOM, Event, Anim, Switchable, undefined) {

    var DISPLAY = 'display',
        BLOCK = 'block',
        NONE = 'none',
        OPACITY = 'opacity',
        Z_INDEX = 'z-index',
        POSITION = 'position',
        RELATIVE = 'relative',
        ABSOLUTE = 'absolute',
        SCROLLX = 'scrollx',
        SCROLLY = 'scrolly',
        FADE = 'fade',
        LEFT = 'left',
        TOP = 'top',
        FLOAT = 'float',
        PX = 'px',
        Effects;
//        EVENT_ADDED = 'added',
//        EVENT_REMOVED = 'removed';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: 'easeNone' // easing method
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function (callback) {
            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            if (fromPanels) {
                DOM.css(fromPanels, DISPLAY, NONE);
            }
            DOM.css(toPanels, DISPLAY, BLOCK);
            callback && callback();
        },

        // 淡隐淡现效果
        fade: function (callback) {

            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            if (fromPanels && fromPanels.length !== 1) {
                S.error('fade effect only supports steps == 1.');
            }

            var cfg = self.config,
                fromEl = fromPanels ? fromPanels[0] : null,
                toEl = toPanels[0];

            if (self.anim) {
                // 不执行回调
                self.anim.stop();
                // 防止上个未完，放在最下层
                DOM.css(self.anim.fromEl, {
                    zIndex: 1,
                    opacity: 0
                });
                // 把上个的 toEl 放在最上面，防止 self.anim.toEl == fromEL
                // 压不住后面了
                DOM.css(self.anim.toEl, "zIndex", 9);
            }

            // 首先显示下一张
            DOM.css(toEl, OPACITY, 1);

            if (fromEl) {
                // 动画切换
                self.anim = new Anim(fromEl,
                    { opacity: 0 },
                    cfg.duration,
                    cfg.easing,
                    function () {
                        self.anim = undefined; // free
                        // 切换 z-index
                        DOM.css(toEl, Z_INDEX, 9);
                        DOM.css(fromEl, Z_INDEX, 1);
                        callback && callback();
                    }).run();
                self.anim.toEl = toEl;
                self.anim.fromEl = fromEl;
            } else {
                //初始情况下没有必要动画切换
                DOM.css(toEl, Z_INDEX, 9);
                callback && callback();
            }
        },

        // 水平/垂直滚动效果
        scroll: function (callback, direction, forceAnimation) {
            var self = this,
                fromIndex = self.fromIndex,
                cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * self.activeIndex,
                props = { };

            props[isX ? LEFT : TOP] = -diff + PX;

            if (self.anim) {
                self.anim.stop();
            }
            // 强制动画或者不是初始化
            if (forceAnimation ||
                fromIndex > -1) {
                self.anim = new Anim(self.content, props,
                    cfg.duration,
                    cfg.easing,
                    function () {
                        self.anim = undefined; // free
                        callback && callback();
                    }).run();
            } else {
                DOM.css(self.content, props);
                callback && callback();
            }
        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * 添加插件
     * attached members:
     *   - this.viewSize
     */
    Switchable.addPlugin({

        priority: 10,

        name: 'effect',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function (host) {
            var cfg = host.config,
                effect = cfg.effect,
                panels = host.panels,
                content = host.content,
                steps = cfg.steps,
                panels0 = panels[0],
                container = host.container,
                activeIndex = host.activeIndex;

            // 注：所有 panel 的尺寸应该相同
            // 最好指定第一个 panel 的 width 和 height, 因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (effect !== NONE) { // effect = scrollx, scrolly, fade

                // 这些特效需要将 panels 都显示出来
                DOM.css(panels, DISPLAY, BLOCK);

                switch (effect) {
                    // 如果是滚动效果
                    case SCROLLX:
                    case SCROLLY:

                        // 设置定位信息，为滚动效果做铺垫
                        DOM.css(content, POSITION, ABSOLUTE);

                        // 注：content 的父级不一定是 container
                        if (DOM.css(content.parentNode, POSITION) == "static") {
                            DOM.css(content.parentNode, POSITION, RELATIVE);
                        }

                        // 水平排列
                        if (effect === SCROLLX) {
                            DOM.css(panels, FLOAT, LEFT);
                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            DOM.width(content, "999999px");
                        }

                        // 只有 scrollX, scrollY 需要设置 viewSize
                        // 其他情况下不需要
                        // 1. 获取高宽
                        host.viewSize = [
                            cfg.viewSize[0] || panels0 && DOM.outerWidth(panels0, true) * steps,
                            cfg.viewSize[1] || panels0 && DOM.outerHeight(panels0, true) * steps
                        ];

                        if (!host.viewSize[0]) {
                            S.error('switchable must specify viewSize if there is no panels');
                        }

                        if (steps == 1 && panels0) {
                            var realStep = 1;
                            var viewSize = host.viewSize;
                            var scroller = panels0.parentNode.parentNode;

                            var containerViewSize = [
                                Math.min(DOM.width(container), DOM.width(scroller)),
                                Math.min(DOM.height(container), DOM.height(scroller))
                            ];

                            if (effect == 'scrollx') {
                                realStep = Math.floor(containerViewSize[0] / viewSize[0]);
                            } else if (effect == 'scrolly') {
                                realStep = Math.floor(containerViewSize[1] / viewSize[1]);
                            }

                            if (realStep > cfg.steps) {
                                // !TODO ugly _realStep
                                host._realStep = realStep;
                            }
                        }

                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        var min = activeIndex * steps,
                            max = min + steps - 1,
                            isActivePanel;

                        S.each(panels, function (panel, i) {
                            isActivePanel = i >= min && i <= max;
                            DOM.css(panel, {
                                opacity: isActivePanel ? 1 : 0,
                                position: ABSOLUTE,
                                zIndex: isActivePanel ? 9 : 1
                            });
                        });
                        break;
                }
            }

            // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
        }
    });

    /**
     * 覆盖切换方法
     */
    S.augment(Switchable, {

        _switchView: function (direction, ev, callback) {

            var self = this,
                cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, function () {
                self._fireOnSwitch(ev);
                callback && callback.call(self);
            }, direction);
        }

    });

    return Switchable;

}, { requires: ["dom", "event", "anim", "./base"]});
/**
 * yiminghe@gmail.com：2011.06.02 review switchable
 */
