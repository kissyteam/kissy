/**
 * @fileOverview Switchable Circular Plugin
 * @author lifesinger@gmail.com
 */
KISSY.add('switchable/circular', function (S, DOM, Anim, Switchable) {

    var POSITION = 'position',
        RELATIVE = 'relative',
        LEFT = 'left',
        TOP = 'top',
        EMPTY = '',
        PX = 'px',
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
    function circularScroll(callback, direction) {
        var self = this,
            fromIndex = self.fromIndex,
            cfg = self.config,
            len = self.length,
            isX = cfg.scrollType === SCROLLX,
            prop = isX ? LEFT : TOP,
            index = self.activeIndex,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            panels = self.panels,
            steps = self.config.steps,
            props = {},
            isCritical,
            isBackward = direction === BACKWARD;

        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && fromIndex === 0 && index === len - 1)
            || (!isBackward && fromIndex === len - 1 && index === 0);

        // 开始动画
        if (self.anim) {
            self.anim.stop();
            // 快速的话会有点问题
            // 上一个 relative 没清掉：上一个还没有移到该移的位置
            if (panels[fromIndex * steps].style.position == "relative") {
                // 快速移到 reset 后的结束位置，用户不会察觉到的！
                resetPosition.call(self, panels, fromIndex, prop, viewDiff, 1);
            }
        }

        if (isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, panels, isBackward, prop, viewDiff);
        }

        props[prop] = diff + PX;

        if (fromIndex > -1) {
            self.anim = new Anim(self.content,
                props,
                cfg.duration,
                cfg.easing,
                function () {
                    if (isCritical) {
                        // 复原位置
                        resetPosition.call(self, panels, isBackward, prop, viewDiff, 1);
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
    function adjustPosition(panels, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps;

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
    function resetPosition(panels, isBackward, prop, viewDiff, setContent) {
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

        if (setContent) {
            // 瞬移到正常位置
            DOM.css(self.content, prop, isBackward ? -viewDiff * (len - 1) : EMPTY);
        }
    }

    Switchable.adjustPosition = adjustPosition;

    Switchable.resetPosition = resetPosition;

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
 * 2012-04-12 yiminghe@gmail.com
 *  - 修复速度过快时从 0 到最后或从最后到 0 时的 bug ： relative 位置没有 reset
 *
 * 2012-06-02 yiminghe@gmail.com
 *  - review switchable
 *
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 */
