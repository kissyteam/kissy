// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * Imagesflow
 *
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2010-04-05
 * @link   http://www.gracecode.com/
 */

KISSY.add('imagesflow', function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;

    /**
     * Imagesflow 的默认配置
     */
    var defaultConfig = {
        flowLength: 4, // Max number of images on each side of the focussed one
        aspectRatio: 1.964, // Aspect ratio of the ImageFlow container (width divided by height)
        step: 150, // 步长，通常不用更改
        width: 500, // 最大封面的宽
        height: 350, // 最大封面的高
        offset: 0, // 误差
        animSpeed: 50,  // 动画间隔（毫秒）
        switchToMiddle: true // 自动切换到中间
    };
    var MAGIC_NUMBER = 90, MAGIC_DIVISOR = 1.25;
    var EVENT_BEFORE_SWITCH = 'beforeSwitch', 
        EVENT_ON_CURRENT = 'onCurrent', 
        EVENT_ON_TWEEN = 'tween',
        EVENT_SWITCH_IS_DOWN = 'finished';

    var Imagesflow = function(container, config) {
        var self = this;

        if (!(self instanceof Imagesflow)) {
            return new Imagesflow(container, config);
        }
        config = S.merge(defaultConfig, config || {});

        self.panels   = config.panels;
        self.triggers = self.panels;

        Imagesflow.superclass.constructor.call(self, container, config);

        //self._init();
    }
    S.extend(Imagesflow, S.Switchable);

    /**
     *
     */
    S.mix(Imagesflow.prototype, {
        _init: function() {
            var self = this, cfg = self.config, panels = self.panels;

            self.busy        = false;         // 运行状态
            self.curFrame    = 0;             // 当前运行帧
            self.targetFrame = 0;             // 目标滚动帧
            self.zIndex      = panels.length; // 最大 zIndex 值
            self.region      = Dom.getRegion(self.container); // 容器的坐标和大小

            self.maxFocus   = cfg.flowLength * cfg.step;
            self.maxHeight  = self.region.height + Math.round(self.region.height / cfg.aspectRatio); // 最大高度
            self.middleLine = self.region.width / 2; // 中间线

            // 自动切换到中间?
            if (cfg.switchToMiddle) {
                self.switchTo(Math.floor(panels.length/2));
            } else {
                self._frame(0);
            }
        },

        switchTo: function(index) {
            var self = this, cfg = self.config,
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex;

            //S.log('Triggerable.switchTo: index = ' + index);
            
            // 预保存滚动目标
            self.perIndex = parseInt(index, 10);

            // 如果需要切换的是当前，则返回
            if (index === activeIndex && !self.busy) {
                return self;
            }
            if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) return self;

            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers[activeIndex] : null, triggers[index]);
            }

            self.targetFrame = -index * cfg.step;


            // 切换动画效果
            self._switchView();

            // update activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 运行动画
         *
         * @return void
         */
        _switchView: function(fromPanels, toPanels, index, direction) {
            var self = this, panels = self.panels, cfg = self.config;
            if (self.targetFrame < self.curFrame - 1 || self.targetFrame > self.curFrame + 1) {
                // fire onSwitch
                self._frame(self.curFrame + (self.targetFrame - self.curFrame) / 3);
                self._timer = Lang.later(cfg.animSpeed, self, self._switchView);
                self.busy = true;
            } else {
                self.fire(EVENT_SWITCH_IS_DOWN);
                self.busy = false; // 动画完成
            }
        },

        /**
         * 运行每帧动画
         *
         * @return void
         */
        _frame: function(frame) {
            var self = this, cfg = self.config, panels = self.panels, 
                region = self.region, middleLine = self.middleLine - cfg.offset, curPanels, curImgPos;

            self.curFrame = frame; // 标记当前帧

            for (var index = 0, len = panels.length; index < len; index++) {
                curPanels = self.panels[index];
                curImgPos = index * -cfg.step;
                if ((curImgPos + self.maxFocus) < self.targetFrame || (curImgPos - self.maxFocus) > self.targetFrame) {
                    // 隐藏多余的封面
                    Dom.setStyle(curPanels, 'visibility', 'hidden');
                } else {
                    // 动画曲线因子
                    var x = (Math.sqrt(10000 + frame * frame) + 100), xs = frame / x * middleLine + middleLine;
                    var height = (cfg.width / cfg.height * MAGIC_NUMBER) / x * middleLine, width = 0;

                    if (height > self.maxHeight) {
                        height = self.maxHeight;
                    }
                    width  = cfg.width / cfg.height * height;

                    // 计算并设置当前位置
                    Dom.setStyle(curPanels, 'left', xs - (MAGIC_NUMBER/MAGIC_DIVISOR) / x * middleLine + 'px');
                    if (height && width) {
                        Dom.setStyle(curPanels, 'height', height + 'px');
                        Dom.setStyle(curPanels, 'width',  width + 'px');
                        Dom.setStyle(curPanels, 'top', region.height / 2 - height / 2 + 'px');
                    }
                    Dom.setStyle(curPanels, 'z-index', self.zIndex * 100 - Math.ceil(x));
                    //*/

                    // 重复绑定事件
                    // @todo 效率提升
                    ///*
                    ~function(index){
                        if (self.perIndex == index) {
                            curPanels.onclick = function(e) {
                                return self.fire(EVENT_ON_CURRENT, {panel: curPanels, index: index});
                            }
                        } else {
                            curPanels.onclick = function(e) {
                                self.switchTo(index);
                                return false;
                            }
                        }
                    }(index);
                    // */

                    Dom.setStyle(curPanels, 'visibility', 'visible');
                }
                self.fire(EVENT_ON_TWEEN, {panel: curPanels, index: index});
                frame += cfg.step;
            }
        }
    });

    S.Imagesflow = Imagesflow;
});
