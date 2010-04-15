// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * CoversFlow
 * @author mingcheng<i.feelinglucky#gmail.com> - http://www.gracecode.com/
 * @update log:
 *    [2010-04-13] mingcheng: 更改算法
 *    [2010-04-08] yubo: 精简 & 优化部分代码
 */

KISSY.add('coversflow', function(S) {
    var Y = YAHOO.util, YDOM = Y.Dom, DOM = S.DOM, Event = S.Event,
        VISIBILITY = 'visibility', CLICK = 'click',
        MAGIC_NUMBER = 90,
        MAGIC_DIVISOR = 1.25,
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        EVENT_ON_CURRENT = 'onCurrent',
        EVENT_TWEEN = 'tween',
        EVENT_FINISHED = 'finished',

        /**
         * 默认配置
         */
        defaultConfig = {
            step: 50,       // 步长，通常不用更改
            width: 330,     // 最大封面的宽
            height: 200,    // 最大封面的高
            animSpeed: 50,  // 动画间隔（毫秒）
            autoSwitchToMiddle: true, // 自动切换到中间
            hasTriggers: false, // 触点就是 panels
            circular: true
        };

    function CoversFlow(container, config) {
        var self = this;

        if (!(self instanceof CoversFlow)) {
            return new CoversFlow(container, config);
        }

        config = S.merge(defaultConfig, config || {});
        CoversFlow.superclass.constructor.call(self, container, config);
        self._initFlow();
    }
    S.extend(CoversFlow, S.Switchable);

    S.augment(CoversFlow, {
        /**
         * 计算当前封面对应其他封面的相对位置
         *
         * @return Array
         */
        _adjustOffset: function(index) {
            var self = this, panels = self.panels, len = self.length,
                size = Math.floor(len / 2), result = [];

            // 将封面全部初始化为 0 
            for (var i = 0; i < len; i++) {
                result[i] = 0;
            }

            // 排列右边
            for (var i = 1, j = 0; i <= size; i++) {
                if (typeof result[index + i] != 'undefined') {
                    result[index + i] = i;
                } else {
                    result[j] = i;
                    j++;
                }
            }

            // 排列左边
            for (var i = 1, j = len - 1; i <= size; i++) {
                if (typeof result[index - i] != 'undefined') {
                    result[index - i] = i * -1;
                } else {
                    result[j] = i * -1;
                    j--;
                }
            }

            return result;
        },

        _initFlow: function() {
            var self = this, config = self.config;
            
            self.activeIndex = -1;              // 当前滚动位置
            self.busy        = false;           // 运行状态
            self.curFrame    = 0;               // 当前运行帧
            self.targetFrame = 0;               // 目标滚动帧
            self.zIndex      = self.length;     // 最大 zIndex 值
            self.region = YDOM.getRegion(self.container); // 容器的坐标和大小
            self.middle = {x:self.region.width/2, y:self.region.height/2}; // 中点

            // 事件注入
            self.on(EVENT_BEFORE_SWITCH, function(ev) {
                if (self.busy) { return false; }
                var cfg = self.config, index = ev.toIndex, offset = self.activeIndex - index;
                self.direction = offset > 0 ? 1 : -1; // 方向
                self.perIndex = index; // 预保存滚动目标
                self.targetFrame = -index * self.config.step;
                self.offsets = self._adjustOffset(index);
            });

            // 自动切换到中间
            if (config.autoSwitchToMiddle && false) {
                self.switchTo(Math.floor(self.length / 2));
            } else {
                self.switchTo(0); // 滚动到第一个位置
            }
        },

        _switchView: function() {
            var self = this, cfg = self.config;
            if (self.targetFrame < self.curFrame - 1 || self.targetFrame > self.curFrame + 1) {
                // fire onSwitch
                self._frame(self.curFrame + (self.targetFrame - self.curFrame) / 3);
                self._timer = S.later(self._switchView, cfg.animSpeed, false, self);
                self.busy = true;
            } else {
                self.fire(EVENT_FINISHED);
                self.busy = false; // 动画完成
            }
        },

        /**
         * 运行每帧动画
         */
        _frame: function(frame) {
            var self = this, cfg = self.config, panels = self.panels,
                region = self.region, middle = self.middle, offsets = self.offsets,
                middleX = middle.x, middleY = middle.y;

            self.curFrame = frame; // 标记当前帧

            for (var index = 0, length = self.length; index < length; index++) {
                var offset = offsets[index], panel = panels[index];
                var x = Math.abs(Math.floor(self.targetFrame - frame)) * offset;

                x = Math.sqrt(x * x);

                    //x  = Math.sqrt(offset) + frame, 
                    xs = frame / x * middleX + middleX;


console.info(x);
console.warn(self.perIndex)
console.warn(self.activeIndex)
break;

                    var height = (cfg.width/cfg.height * 10) * x * middleX;
                    var width  = cfg.width/cfg.height * height;

//                    console.warn(self.targetFrame);
//                    console.info(frame);
                    var top  = region.height/2 - height/2;
                    var left = xs - (10 / 1.2) / x * middleX;

                /*
                var offset = offsets[index], panel = panels[index],
                    x = Math.pow(-((offset * 50 - frame)/20), 2); // 二次函数因子

                var height = Math.abs(cfg.height - x * 2);


                    console.info(index + " : " + height);
                

                var left = middleX - (width / 2) + offset * 50;
                var top = middleY - (height/2);
                */

                DOM.css(panel, 'height', height + 'px');
                DOM.css(panel, 'width',  width + 'px');
                DOM.css(panel, 'top',    top  + 'px');
                DOM.css(panel, 'left',   left + 'px');
                DOM.css(panel, 'zIndex', length - Math.abs(offset));

                // 绑定点击事件
                self._bindPanel(panel, index);
                //frame += cfg.step;
            }
        },

        /**
         * 绑定事件
         */
        _bindPanel: function(curPanel, index) {
            var self = this;

            Event.remove(curPanel);

            if (self.perIndex === index) {
                Event.add(curPanel, CLICK, function() {
                    return self.fire(EVENT_ON_CURRENT, { panel: curPanel, index: index });
                });
            } else {
                Event.add(curPanel, CLICK, function(ev) {
                    ev.preventDefault();
                    self.switchTo(index);
                });
            }
        }
    });

    S.CoversFlow = CoversFlow;

});

/**
 * TODO:
 *   - 进一步优化算法和部分 api
 */
