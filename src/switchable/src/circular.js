/**
 * @fileOverview Switchable Circular Plugin
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('switchable/circular', function (S, DOM, Anim, Switchable) {

    var clearPosition = {
        position:'',
        left:'',
        top:''
    };

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular:false
    });


    function seamlessCircularScroll(callback) {
        var self = this,
            fromIndex = self.fromIndex,
            cfg = self.config,
            len = self.length,
            isX = cfg.scrollType === 'scrollx',
            prop = isX ? 'left' : 'top',
            index = self.activeIndex,
            viewDiff = self.viewSize[isX ? 0 : 1],
            panels = self.panels,
            props = {},
            v = {},
            _realStep = self._realStep,
            totalXX = viewDiff * len;

        props[prop] = -viewDiff * index;

        if (fromIndex == -1) {
            // 初始化
            DOM.css(self.content, props);
            callback && callback();
            return;
        }

        // realStep 补帧
        if (index + _realStep > len && DOM.css(panels[0], "position") != 'relative') {
            v = { position:'relative'};
            v[prop] = totalXX;

            // 关键要同步！ realStep 取消或设定相对定位的同时要设置 left，保持在用户的显示位置不变
            DOM.css(panels.slice(0, _realStep), v);
            if (fromIndex >= 0 && fromIndex < _realStep) {
                DOM.css(self.content, prop,
                    -(viewDiff * (len + fromIndex)));
            }
        }
        // 补帧了，但是 index 在补帧内，恢复原始位置，取消补帧
        else if (index > 0 && index < _realStep && DOM.css(panels[0], "position") == 'relative') {
            DOM.css(panels.slice(0, _realStep), clearPosition);
            if (fromIndex >= 0 && fromIndex < _realStep) {
                DOM.css(self.content, prop, -(viewDiff * (fromIndex)));
            }
        }

        // 只有 index==0 情况 last->0 平滑过渡
        if (panels[index].style.position == "relative") {
            // S.log(index+"");
            props[prop] = -viewDiff * (len + index);
        }

        if (self.anim) {
            self.anim.stop();
        }

        self.anim = new Anim(self.content,
            props,
            cfg.duration,
            cfg.easing,
            function () {
                if (index == 0) {
                    DOM.css(panels.slice(0, _realStep), clearPosition);
                    DOM.css(self.content, prop, "");
                }
                // free
                self.anim = 0;
                callback && callback();
            }).run();


    }

    /**
     * 循环滚动效果函数
     */
    function circularScroll(callback, direction) {
        var self = this,
            fromIndex = self.fromIndex,
            cfg = self.config,
            len = self.length,
            isX = cfg.scrollType === 'scrollx',
            prop = isX ? 'left' : 'top',
            index = self.activeIndex,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            panels = self.panels,
            steps = self.config.steps,
            props = {},
            isCritical,
            isBackward = direction === 'backward';

        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && fromIndex === 0 && index === len - 1)
            ||
            (!isBackward && fromIndex === len - 1 && index === 0);

        // 开始动画
        if (self.anim) {
            self.anim.stop();
            // 快速的话会有点问题
            // 上一个 'relative' 没清掉：上一个还没有移到该移的位置
            if (panels[fromIndex * steps].style.position == "relative") {
                // 快速移到 reset 后的结束位置，用户不会察觉到的！
                resetPosition.call(self, panels, fromIndex, prop, viewDiff, 1);
            }
        }

        if (isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, panels, index, prop, viewDiff);
        }

        props[prop] = diff + 'px';

        if (fromIndex > -1) {
            self.anim = new Anim(self.content,
                props,
                cfg.duration,
                cfg.easing,
                function () {
                    if (isCritical) {
                        // 复原位置
                        resetPosition.call(self, panels, index, prop, viewDiff, 1);
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
    function adjustPosition(panels, start, prop, viewDiff) {
        var self = this,
            cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            from = start * steps,
            actionPanels,
            to = (start + 1) * steps;

        // 调整 panels 到下一个视图中
        actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, 'position', 'relative');
        DOM.css(actionPanels, prop, (start ? -1 : 1) * viewDiff * len);

        // 偏移量
        return start ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, start, prop, viewDiff, setContent) {
        var self = this,
            cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            from = start * steps,
            actionPanels,
            to = (start + 1) * steps;

        // 滚动完成后，复位到正常状态
        actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, 'position', '');
        DOM.css(actionPanels, prop, '');

        if (setContent) {
            // 瞬移到正常位置
            DOM.css(self.content, prop, start ? -viewDiff * (len - 1) : '');
        }
    }

    Switchable.adjustPosition = adjustPosition;

    Switchable.resetPosition = resetPosition;

    /**
     * 添加插件
     */
    Switchable.addPlugin({

        name:'circular',

        priority:5,

        /**
         * 根据 effect, 调整初始状态
         */
        init:function (host) {
            var cfg = host.config,
                realStep,
                scroller,
                viewSize,
                panels,
                container,
                effect = cfg.effect;

            // 仅有滚动效果需要下面的调整
            if (cfg.circular && (effect === 'scrollx' || effect === 'scrolly')) {

                // 覆盖滚动效果函数
                cfg.scrollType = effect; // 保存到 scrollType 中

                /*
                 特殊处理：容器宽度比单个 item 宽，但是要求 item 一个个循环滚动，关键在于动画中补全帧的处理
                 */
                panels = host.panels;
                container = host.container;

                if (cfg.steps == 1 && panels.length) {
                    realStep = 1;
                    scroller = panels[0].parentNode.parentNode;
                    viewSize = [Math.min(DOM.width(container), DOM.width(scroller)),
                        Math.min(DOM.height(container), DOM.height(scroller))];

                    if (effect == 'scrollx') {
                        realStep = Math.floor(viewSize[0] /
                            ( DOM.outerWidth(panels[0], true)));
                    } else if (effect == 'scrolly') {
                        realStep = Math.floor(viewSize[1] /
                            (DOM.outerHeight(panels[0], true)));
                    }

                    if (realStep > cfg.steps) {
                        host._realStep = realStep;
                        cfg.effect = seamlessCircularScroll;
                    }
                }

                if (!host._realStep) {
                    cfg.effect = circularScroll;
                }
            }
        }
    });

}, { requires:["dom", "anim", "./base", "./effect"]});

/**
 * 2012-04-12 yiminghe@gmail.com
 *  - 修复速度过快时从 0 到最后或从最后到 0 时的 bug ： 'relative' 位置没有 reset
 *
 * 2012-06-02 yiminghe@gmail.com
 *  - review switchable
 *
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 'backward' 滚动？需要更灵活
 */
