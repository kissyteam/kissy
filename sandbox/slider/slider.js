// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * KISSKY - Slider module
 *
 * @creator mingcheng<i.feelinglucky#gmail.com>
 * @since   2009-12-16
 * @link    http://www.gracecode.com/
 */

KISSY.add("slider", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;

    /**
     * 默认配置
     */
	var defaultConfig = {
		triggersClass: 'triggers', // triggers 的 className
        // panels: null, // 如果指定，则不自动寻找，默认获取 container 的所有 li
        //triggers: null, // 如果指定，则不自动创建 triggers
		currentClass: 'current', // 标记 trigger 当前的 className
		eventType: 'mouse', // trigger 触发方式: 'click' 为点击 'mouse' 为鼠标悬浮
        effect: 'none', // 展现效果，目前有三个效果 'none', 'fade', 'scroll'，
                        // 如果此参数为 function，则使用自定义效果
		delay: 5000, // 卡盘间延迟展现时间
		speed: 500, // 卡盘滚动以及渐变时间，当效果为 'none' 时无效
		autoPlay: true, // 是否自动滚动
        //switchSize: false,
        startAt: 0, // 开始滚动第几个卡片
        //onSwitch: function() {},
        direction: 'vertical' // 滚动方向 'horizontal(h)' or 'vertical(v)'
	};

    /**
     * 展现效果
     */
    var _effects = {
        'none': function() {
            var config = this.config, direction = this.direction;
            this.scroller[direction.x ? 'scrollLeft' : 'scrollTop'] = this.next * this.switchSize;
        },

        'fade': function() {
            var config = this.config, anim = this._anim, panels = this.panels,
                current = panels[this.current] || panels[0], next = panels[this.next] || panels[panels.length - 1];

            // init fade elements at first time
            if (!this._initFade) {
                Dom.setStyle(panels, 'position', 'absolute');
                Dom.setStyle(panels, 'top',  config.slideOffsetY || 0);
                Dom.setStyle(panels, 'left', config.slideOffsetX || 0);
                Dom.setStyle(panels, 'z-index', 1);
                Dom.setStyle(panels, 'display', 'none');
                this.initFade = true;
            }

            if (anim && this._fading) {
                anim.stop();
            }
            this._fading = true;
            Dom.setStyle(current, 'z-index', 2);
            Dom.setStyle(next, 'z-index', 1); Dom.setStyle(next, 'opacity', 1);
            Dom.setStyle([current, next] , 'display', '');
            anim = new YAHOO.util.Anim(current, {opacity: {from: 1, to: 0}}, 
                            config.speed/1000 || .5, config.easing || Y.Easing.easeNone); 
            anim.onComplete.subscribe(function() {
                Dom.setStyle(current, 'display', 'none');
                Dom.setStyle([current, next], 'z-index', 1);
                this._fading = false;
            }, this, true);

            anim.animate();
        },

        'scroll': function() {
            var config = this.config, anim = this._anim;
            var attributes, 
                from = this.current * this.switchSize, to = this.next * this.switchSize;

            if (this.direction.x) {
                attributes = {
                    scroll: {
                        from: [from],
                        to:   [to]
                    }
                }; 
            } else {
                attributes = {
                    scroll: {
                        from: [, from],
                        to:   [, to]
                    }
                };
            }

            if (anim) { anim.stop(); }
            anim = new Y.Scroll(this.scroller, attributes, config.speed/1000 || .5, config.easing || Y.Easing.easeOutStrong);
            /*
            anim.onComplete.subscribe(function() {
                // ...
            });
            */
            anim.animate();
        }
    };

    var Slider = function(container, config) {
        this.config = Lang.merge(defaultConfig, config || {});
        this.container = Dom.get(container);

        // 确定滚动方向，方便效果函数操作
        this.direction = {
            x: (config.direction == 'horizontal') || (config.direction == 'h'),
            y: (config.direction == 'vertical')   || (config.direction == 'v')       
        };

        // 获取面板
        this.panels = this.config.panels || Array().slice.call(container.getElementsByTagName('li'));

        // 计算面板的总数
        this.total = this.panels.length;

        // 初始化
        this._init();
    };

    Lang.augmentObject(Slider.prototype, {
        _init: function() {
            var config = this.config, container = this.container, effect;

            // 计算切换大小，因此所有的 panels 必须同样大小
            this.switchSize = parseInt(this.config.switchSize, 10);
            if (!this.switchSize) {
                var region = Y.Region.getRegion(this.panels[0]);
                this.switchSize = region[this.direction.x ? 'width' : 'height'];
            }

            // 获取滚动元素，默认为 li 的上级，也就是 li 或者 ol
            this.scroller = config.scroller || this.panels[0].parentNode;

            // 触发器
            this.triggers = config.triggers;
            if (!this.triggers) {
                var triggers = document.createElement('ul');
                Dom.addClass(triggers, config.triggersClass);
                for(var i = 0; i < this.total;) {
                    var t = document.createElement('li');
                    t.innerHTML = ++i;
                    triggers.appendChild(t);
                }
                this.container.appendChild(triggers);
                this.triggers = Array().slice.call(triggers.getElementsByTagName('li'));
            }

            // 确定开始的位置
            this.current = Lang.isNumber(config.startAt) ? config.startAt : 0;

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

            for (var i = 0, len = this.triggers.length, _timer, ie = YAHOO.env.ie; i < len; i++) {
                (function(index) {
                    switch(config.eventType.toLowerCase()) {
                        case 'mouse':
                            Event.on(this.triggers[index], ie ? 'mouseenter': 'mouseover', function(e) {
                                if (_timer) _timer.cancel();
                                _timer = Lang.later(50, this, function() {
                                    this.switchTo(index);                               
                                });
                            }, this, true);

                            Event.on(this.triggers[index], ie ? 'mouseleave' : 'mouseout', function(e) {
                                _timer.cancel();
                                if (config.autoPlay) {
                                    this.wakeup();
                                }
                            }, this, true);
                            break;
                        default: 
                            Event.on(this.triggers[index], 'click', function(e) {
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
            Dom.addClass(this.triggers[this.current], config.currentClass);
            this.scroller.scrollTop = this.switchSize * this.current;
            this.scroller.scrollLeft = this.switchSize * this.current;

            // 是否自动滚动
            if (config.autoPlay && this.panels.length > 1) {
                this.pause = false;
                Lang.later(config.delay, this, 
                    function() {
                        this.switchTo(this.current + 1);
                    }
                );
            }
        },

        switchTo: function(index) {
            var config = this.config;

            //
            if (this.pause && !Lang.isNumber(index)) {
                return;
            }

            //
            if (this.timer) this.timer.cancel();

            //
            this.next = Lang.isNumber(index) ? index : this.current + 1;
            if (this.next >= this.total) {
                this.next = 0;
            }

            //
            this.effect.fire();

            // 
            this.current = this.next;

            // run callback
            if (this.onSwitchEvent) {
                this.onSwitchEvent.fire();
            }

            // make current trigger class
            Dom.removeClass(this.triggers, config.currentClass);
            Dom.addClass(this.triggers[this.current], config.currentClass);

            // continue paly?
            if (config.autoPlay) {
                this.timer = Lang.later(config.delay, this, arguments.callee);
            }
        },

        sleep: function() {
            this.pause = true;
            if (this.timer) {
                this.timer.cancel();
            }
        },

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
