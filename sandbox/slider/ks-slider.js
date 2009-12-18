// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * KISSKY - Slider module
 *
 * @creator mingcheng<i.feelinglucky#gmail.com>
 * @since   2009-12-16
 * @link    http://www.gracecode.com/
 * @change
 *     [+]new feature  [*]improvement  [!]change  [x]bug fix
 *
 *  [+] 2009-12-18
 *      初始化版本
 */

KISSY.add("slider", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;

    /**
     * 默认配置
     */
	var defaultConfig = {
		triggersClass: 'triggers', // triggers 的 className
        //panels: null, // 如果指定，则不自动寻找，默认获取 container 的所有 li
        //triggers: null, // 如果指定，则不自动创建 triggers
		currentClass: 'current', // 标记 trigger 当前的 className
		eventType: 'mouse', // trigger 触发方式: 'click' 为点击 'mouse' 为鼠标悬浮
        effect: 'none', // 展现效果，目前有三个效果 'none', 'fade', 'scroll'，
                        // 如果此参数为 function，则使用自定义效果
		delay: 5000, // 卡盘间延迟展现时间
		speed: 500, // 卡盘滚动以及渐变时间，当效果为 'none' 时无效
		autoPlay: true, // 是否自动滚动
        //switchSize: false, // 滚动距离，如未指定，则取 panel 的高宽
        startAt: 0, // 开始滚动第几个卡片
        //onSwitch: function() {}, // 滚动时的回调
        direction: 'vertical' // 滚动方向 'horizontal(h)' or 'vertical(v)'
	};

    /**
     * 展现效果
     */
    var _effects = {
        /**
         * 默认无任何效果，直接切换
         */
        'none': function() {
            var t = this, config = t.config;
            t.scroller[t.direction.x ? 'scrollLeft' : 'scrollTop'] = t.next * t.switchSize;
        },

        /**
         * 渐变效果
         */
        'fade': function() {
            var t = this, config = t.config, panels = t.panels, setStyle = Dom.setStyle,
                current = panels[t.current] || panels[0], next = panels[t.next] || panels[panels.length - 1];

            // 在首次运行时初始化节点
            // @todo 需要优化
            if (!this._initFade) {
                setStyle(panels, 'position', 'absolute');
                setStyle(panels, 'top',  config.slideOffsetY || 0);
                setStyle(panels, 'left', config.slideOffsetX || 0);
                setStyle(panels, 'z-index', 1);
                setStyle(panels, 'display', 'none');
                this.initFade = true;
            }

            // 动画前的初始化
            if (this._anim && this._fading) {
                this._anim.stop();
                setStyle(panels, 'display', 'none');
            }
            this._fading = true;
            setStyle(current, 'z-index', 2);
            setStyle(next, 'z-index', 1);
            setStyle(next, 'opacity', 1);
            setStyle([current, next] , 'display', '');

            // 开始动画
            this._anim = new YAHOO.util.Anim(current, {opacity: {from: 1, to: 0}}, 
                                    config.speed/1000 || .5, config.easing || Y.Easing.easeNone); 
            this._anim.onComplete.subscribe(function() {
                setStyle(current, 'display', 'none');
                setStyle([current, next], 'z-index', 1);
                this._fading = false;
            }, t, true);

            this._anim.animate();
        },

        /**
         * 滚动效果
         */
        'scroll': function() {
            var t = this, config = t.config, attributes = {scroll: {to:[]}};
            attributes.scroll.to[t.direction.x ? 0 : 1] = t.next * t.switchSize;
            if (this._anim) this._anim.stop();
            this._anim = new Y.Scroll(this.scroller, attributes, 
                    config.speed/1000 || .5, config.easing || Y.Easing.easeOutStrong);
            /*
            this._anim.onComplete.subscribe(function() {
                // ...
            });
            // */
            this._anim.animate();
        }
    };


    /**
     * Slider 组件
     *
     * @params container Slider 容器
     * @params config 配置函数
     * @return Slider 实例
     */
    var Slider = function(container, config) {
        this.container = Dom.get(container);
        this.config = Lang.merge(defaultConfig, config || {});
        this._init();
    };

    S.mix(Slider.prototype, {
        _init: function() {
            var config = this.config, container = this.container, effect;

            // 确定滚动方向，方便效果函数操作
            var direction = {
                x: (config.direction == 'horizontal') || (config.direction == 'h'),
                y: (config.direction == 'vertical')   || (config.direction == 'v')       
            };


            // 获取面板
            var panels = config.panels || Lang.merge([], container.getElementsByTagName('li'));

            // 计算面板的总数
            var total = panels.length;


            // 计算切换大小，因此所有的 panels 必须同样大小
            var switchSize = parseInt(this.config.switchSize, 10);
            if (!switchSize) {
                switchSize = panels[0][direction.x ? 'clientWidth' : 'clientHeight'];
            }

            // 获取滚动元素，默认为 li 的上级，也就是 li 或者 ol
            var scroller = config.scroller || panels[0].parentNode;

            // 生成触发器
            var triggers = config.triggers;
            if (!triggers) {
                var triggers = document.createElement('ul');
                Dom.addClass(triggers, config.triggersClass);
                for(var i = 0; i < total;) {
                    var tmp = document.createElement('li');
                    tmp.innerHTML = ++i;
                    triggers.appendChild(tmp);
                }
                container.appendChild(triggers);
                triggers = Lang.merge([], triggers.getElementsByTagName('li'));
            }

            // 确定开始的位置
            var current = Lang.isNumber(config.startAt) ? config.startAt : 0;

            // 确定滚动效果
            if (Lang.isFunction(config.effect)) {
                effect = config.effect;
            } else if (Lang.isString(config.effect) && Lang.isFunction(_effects[config.effect])) {
                effect = _effects[config.effect];
            } else {
                effect = effect['none'];
            }
            this.effect = new Y.CustomEvent('effect', this, false, Y.CustomEvent.FLAT);
            this.effect.subscribe(effect);

            // 绑定回调
            if (Lang.isFunction(config.onSwitch)) {
                this.onSwitchEvent = new Y.CustomEvent('onSwitchEvent', this, false, Y.CustomEvent.FLAT);
                this.onSwitchEvent.subscribe(config.onSwitch);
            }

            // 绑定事件
            Event.on(container, 'mouseover', function(e) {
                this.sleep();
            }, this, true);

            Event.on(container, 'mouseout', function(e) {
                if (config.autoPlay) {
                    this.wakeup();
                }
            }, this, true);

            for (var i = 0, len = triggers.length, _timer, ie = YAHOO.env.ie; i < len; i++) {
                (function(index) {
                    switch(config.eventType.toLowerCase()) {
                        case 'mouse':
                            Event.on(triggers[index], ie ? 'mouseenter': 'mouseover', function(e) {
                                //Event.stopEvent(e);
                                if (_timer) _timer.cancel();
                                _timer = Lang.later(200, this, function() {
                                    this.switchTo(index);                               
                                });
                            }, this, true);

                            Event.on(triggers[index], ie ? 'mouseleave' : 'mouseout', function(e) {
                                if (_timer) _timer.cancel();
                                if (config.autoPlay) this.wakeup();
                            }, this, true);
                            break;
                        default: 
                            Event.on(triggers[index], 'click', function(e) {
                                Event.stopEvent(e);
                                if (_timer) _timer.cancel();
                                _timer = Lang.later(50, this, function() {
                                    this.switchTo(index);                               
                                });
                            }, this, true);
                    }
                }).call(this, i);
            }

            // 初始化 triggers 的样式以及滚动距离
            Dom.addClass(triggers[current], config.currentClass);
            scroller.scrollTop = switchSize * current;
            scroller.scrollLeft = switchSize * current;

            // 是否自动滚动
            if (config.autoPlay && total > 1) {
                this.pause = false;
                Lang.later(config.delay, this, 
                    function() {
                        this.switchTo(current + 1);
                    }
                );
            }

            // 绑定对应属性到实例
            this.direction = direction;
            this.panels = panels;
            this.switchSize = switchSize;
            this.scroller = scroller;
            this.triggers = triggers;
            this.current = current;
            this.total = total;
        },

        /**
         * 滚动到指定的位置
         */
        switchTo: function(index) {
            var config = this.config, t = this;

            // 如果在停止状态，则不继续运行
            if (t.pause && !Lang.isNumber(index)) {
                return;
            }
            if (this.timer) this.timer.cancel();

            // 计算下个标记位
            this.next = Lang.isNumber(index) ? index : t.current + 1;
            if (this.next >= t.total) {
                this.next = Lang.isNumber(config.startAt) ? config.startAt : 0;
            }

            // 执行效果
            t.effect.fire();

            // 更新标记位
            this.current = this.next;

            // 执行回调
            if (Lang.isObject(t.onSwitchEvent) && t.onSwitchEvent.fire) {
                this.onSwitchEvent.fire();
            }

            // 更新 triggers 的样式
            Dom.removeClass(t.triggers, config.currentClass);
            Dom.addClass(t.triggers[this.current], config.currentClass);

            // 是否继续运行
            if (config.autoPlay) {
                this.timer = Lang.later(config.delay, this, arguments.callee);
            }
        },

        /**
         * 暂停动画
         */
        sleep: function() {
            this.pause = true;
            if (this.timer) {
                this.timer.cancel();
            }
        },

        /**
         * 继续动画
         */
        wakeup: function() {
            if (this.timer) {
                this.timer.cancel();
            }
            this.pause = false;
            this.timer = Lang.later(this.config.delay, this, function() {
                this.switchTo(this.current + 1);
            });
        }
    });

    S.Slider = Slider;
});
