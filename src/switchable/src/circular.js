/**
 * @fileOverview Switchable Circular Plugin
 * @creator  lifesinger@gmail.com
 */
KISSY.add('switchable/circular', function (S, DOM, Anim, Switchable) {

    var POSITION = 'position',
        RELATIVE = 'relative',
        LEFT = 'left',
        TOP = 'top',
        EMPTY = '',
        PX = 'px',
        FORWARD = 'forward',
        BACKWARD = 'backward',
        SCROLLX = 'scrollx',
        SCROLLY = 'scrolly';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular:false
    });

    /**
     * 循环滚动效果函数
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this,
            cfg = self.config,
            len = self.length,
            // 2012-03-08 yiminghe@gmail.com
            // 当前 panel 确切在的位置，而不是
            // panel 将要的位置 activeIndex (trigger 当前位置)
            completedIndex = self.completedIndex,
            isX = cfg.scrollType === SCROLLX,
            prop = isX ? LEFT : TOP,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            props = {},
            isCritical,
            isBackward = direction === BACKWARD;
        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && completedIndex === 0 && index === len - 1)
            || (direction === FORWARD && completedIndex === len - 1 && index === 0);

        if (isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
        }

        props[prop] = diff + PX;

        // 开始动画

        if (self.anim) {
            self.anim.stop();
        }

        if (fromEls) {
            self.anim = new Anim(self.content,
                props,
                cfg.duration,
                cfg.easing,
                function () {
                    if (isCritical) {
                        // 复原位置
                        resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
                    }
                    // free
                    self.anim = undefined;
                    callback && callback();
                }).run();
        } else {
            // 初始化
            DOM.css(self.content, props);
            callback && callback();
        }

    }

    /**
     * 调整位置
     */
    function adjustPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 调整 panels 到下一个视图中
        var actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, POSITION, RELATIVE);
        DOM.css(actionPanels, prop, (isBackward ? -1 : 1) * viewDiff * len);

        // 偏移量
        return isBackward ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this,
            cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps;

        // 滚动完成后，复位到正常状态
        var actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, POSITION, EMPTY);
        DOM.css(actionPanels, prop, EMPTY);

        // 瞬移到正常位置
        DOM.css(self.content, prop, isBackward ? -viewDiff * (len - 1) : EMPTY);
    }

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name:'circular',

        /**
         * 根据 effect, 调整初始状态
         */
        init:function (host) {
            var cfg = host.config;

            // 仅有滚动效果需要下面的调整
            if (cfg.circular && (cfg.effect === SCROLLX || cfg.effect === SCROLLY)) {
                // 覆盖滚动效果函数
                cfg.scrollType = cfg.effect; // 保存到 scrollType 中
                cfg.effect = circularScroll;
            }
        }
    });

}, { requires:["dom", "anim", "./base", "./effect"]});

/**
 * 承玉：2011.06.02 review switchable
 *
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 */
