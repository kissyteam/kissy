/**
 * Switchable
 * @creator  玉伯<lifesinger@gmail.com>,yiminghe@gmail.com
 */
KISSY.add('switchable/base', function(S, DOM, Event, undefined) {

    var DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        EventTarget = S.require("event/target"),
        FORWARD = 'forward', BACKWARD = 'backward',
        DOT = '.',

        EVENT_INIT = 'init',
        EVENT_BEFORE_SWITCH = 'beforeSwitch', EVENT_SWITCH = 'switch',
        CLS_PREFIX = 'ks-switchable-',
        DOM_EVENT = {originalEvent:{target:1}};

    /**
     * Switchable Widget
     * attached members：
     *   - this.container
     *   - this.config
     *   - this.triggers  可以为空值 []
     *   - this.panels    可以为空值 []
     *   - this.content
     *   - this.length
     *   - this.activeIndex
     *   - this.switchTimer
     */
    function Switchable(container, config) {
        var self = this;

        // 调整配置信息
        config = config || {};
        if (!('markupType' in config)) {
            if (config.panelCls) {
                config.markupType = 1;
            } else if (config.panels) {
                config.markupType = 2;
            }
        }

        // init config by hierarchy
        var host = this.constructor;
        while (host) {
            config = S.merge(host.Config, config);
            host = host.superclass ? host.superclass.constructor : null;
        }
        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = DOM.get(container);

        /**
         * 配置参数
         * @type Object
         */
        self.config = config;

        /**
         * triggers
         * @type Array of HTMLElement
         */
        //self.triggers

        /**
         * panels
         * @type Array of HTMLElement
         */
        //self.panels

        /**
         * length = panels.length / steps
         * @type number
         */
        //self.length

        /**
         * the parentNode of panels
         * @type HTMLElement
         */
        //self.content

        /**
         * 当前激活的 index，内部使用，外部设置需要修改对应 html markup
         * 不可和 switchTo 并列设置
         * @type Number
         */
        self.activeIndex = config.activeIndex;

        /**
         * 正打算激活的 index，内部使用，不可外部设置
         * 一般和 activeIndex 相同，有动画时，则有落差
         */
        self.ingIndex = self.activeIndex;

        self._init();
        self._initPlugins();
        self.fire(EVENT_INIT);

        if (self.activeIndex > -1) {

        } else if (S.isNumber(config.switchTo)) {
            self.switchTo(config.switchTo);
        }

    }

    // 默认配置
    Switchable.Config = {
        markupType: 0, // markup 的类型，取值如下：

        // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
        navCls: CLS_PREFIX + 'nav',
        contentCls: CLS_PREFIX + 'content',

        // 1 - 适度灵活：通过 cls 来获取 triggers 和 panels
        triggerCls: CLS_PREFIX + 'trigger',
        panelCls: CLS_PREFIX + 'panel',

        // 2 - 完全自由：直接传入 triggers 和 panels
        triggers: [],
        panels: [],

        // 是否有触点
        hasTriggers: true,

        // 触发类型
        triggerType: 'mouse', // or 'click'
        // 触发延迟
        delay: .1, // 100ms

        activeIndex: -1, // markup 的默认激活项应与 activeIndex 保持一致
        activeTriggerCls: 'ks-active',
        switchTo: 0,  // 初始切换到面板，默认第一个

        // 可见视图内有多少个 panels
        steps: 1,

        // 可见视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
        viewSize: []
    };

    // 插件
    Switchable.Plugins = [];

    S.augment(Switchable, EventTarget, {

            _initPlugins:function() {
                // init plugins by Hierarchy
                var self = this,
                    pluginHost = self.constructor;
                while (pluginHost) {
                    S.each(pluginHost.Plugins, function(plugin) {
                        if (plugin.init) {
                            plugin.init(self);
                        }
                    });
                    pluginHost = pluginHost.superclass ?
                        pluginHost.superclass.constructor :
                        null;
                }
            },

            /**
             * init switchable
             */
            _init: function() {
                var self = this,
                    cfg = self.config;

                // parse markup
                self._parseMarkup();

                // bind triggers
                if (cfg.hasTriggers) {
                    self._bindTriggers();
                }
            },

            /**
             * 解析 markup, 获取 triggers, panels, content
             */
            _parseMarkup: function() {
                var self = this, container = self.container,
                    cfg = self.config,
                    nav, content, triggers = [], panels = [],
                    //i,
                    n
                    //m
                    ;

                switch (cfg.markupType) {
                    case 0: // 默认结构
                        nav = DOM.get(DOT + cfg.navCls, container);
                        if (nav) triggers = DOM.children(nav);
                        content = DOM.get(DOT + cfg.contentCls, container);
                        panels = DOM.children(content);
                        break;
                    case 1: // 适度灵活
                        triggers = DOM.query(DOT + cfg.triggerCls, container);
                        panels = DOM.query(DOT + cfg.panelCls, container);
                        break;
                    case 2: // 完全自由
                        triggers = cfg.triggers;
                        panels = cfg.panels;
                        break;
                }


                // get length
                n = panels.length;
                self.length = n / cfg.steps;

                // 自动生成 triggers
                if (cfg.hasTriggers && n > 0 && triggers.length === 0) {
                    triggers = self._generateTriggersMarkup(self.length);
                }

                // 将 triggers 和 panels 转换为普通数组
                self.triggers = S.makeArray(triggers);
                self.panels = S.makeArray(panels);

                // get content
                self.content = content || panels[0].parentNode;
                self.nav = nav || cfg.hasTriggers && triggers[0].parentNode;
            },

            /**
             * 自动生成 triggers 的 markup
             */
            _generateTriggersMarkup: function(len) {
                var self = this, cfg = self.config,
                    ul = DOM.create('<ul>'), li, i;

                ul.className = cfg.navCls;
                for (i = 0; i < len; i++) {
                    li = DOM.create('<li>');
                    if (i === self.activeIndex) {
                        li.className = cfg.activeTriggerCls;
                    }
                    li.innerHTML = i + 1;
                    ul.appendChild(li);
                }

                self.container.appendChild(ul);
                return DOM.children(ul);
            },

            /**
             * 给 triggers 添加事件
             */
            _bindTriggers: function() {
                var self = this, cfg = self.config,
                    triggers = self.triggers, trigger,
                    i, len = triggers.length;

                for (i = 0; i < len; i++) {
                    (function(index) {
                        trigger = triggers[index];

                        Event.on(trigger, 'click', function() {
                            self._onFocusTrigger(index);
                        });

                        if (cfg.triggerType === 'mouse') {
                            Event.on(trigger, 'mouseenter', function() {
                                self._onMouseEnterTrigger(index, DOM_EVENT);
                            });
                            Event.on(trigger, 'mouseleave', function() {
                                self._onMouseLeaveTrigger(index, DOM_EVENT);
                            });
                        }
                    })(i);
                }
            },

            /**
             * click or tab 键激活 trigger 时触发的事件
             */
            _onFocusTrigger: function(index) {
                var self = this;
                if (!self._triggerIsValid(index)) return; // 重复点击

                this._cancelSwitchTimer(); // 比如：先悬浮，再立刻点击，这时悬浮触发的切换可以取消掉。
                self.switchTo(index, undefined, DOM_EVENT);
            },

            /**
             * 鼠标悬浮在 trigger 上时触发的事件
             */
            _onMouseEnterTrigger: function(index) {
                var self = this;
                if (!self._triggerIsValid(index)) {
                    return;
                } // 重复悬浮。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次触发。

                self.switchTimer = S.later(function() {
                    self.switchTo(index, undefined, DOM_EVENT);
                }, self.config.delay * 1000);
            },

            /**
             * 鼠标移出 trigger 时触发的事件
             */
            _onMouseLeaveTrigger: function() {
                this._cancelSwitchTimer();
            },

            /**
             * 重复触发时的有效判断
             */
            _triggerIsValid: function(index) {
                return this.ingIndex !== index;
            },

            /**
             * 取消切换定时器
             */
            _cancelSwitchTimer: function() {
                var self = this;
                if (self.switchTimer) {
                    self.switchTimer.cancel();
                    self.switchTimer = undefined;
                }
            },

            /**
             * 切换操作，对外 api
             * @param index 要切换的项
             * @param direction 方向，用于 effect
             * @param ev 引起该操作的事件
             * @param callback 运行完回调，和绑定 switch 事件作用一样
             */
            switchTo: function(index, direction, ev, callback) {
                var self = this,
                    cfg = self.config,
                    triggers = self.triggers,
                    panels = self.panels,
                    ingIndex = self.ingIndex,
                    steps = cfg.steps,
                    fromIndex = ingIndex * steps,
                    toIndex = index * steps;

                // 再次避免重复触发
                if (!self._triggerIsValid(index)) {
                    return self;
                }
                if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) {
                    return self;
                }


                // switch active trigger
                if (cfg.hasTriggers) {
                    self._switchTrigger(ingIndex > -1 ?
                        triggers[ingIndex] : null,
                        triggers[index]);
                }

                // switch active panels
                if (direction === undefined) {
                    direction = index > ingIndex ? FORWARD : BACKWARD;
                }
                self.ingIndex = index;
                // switch view
                self._switchView(
                    ingIndex > -1 ? panels.slice(fromIndex, fromIndex + steps) : null,
                    panels.slice(toIndex, toIndex + steps),
                    index,
                    direction, ev, function() {
                        callback && callback.call(self, index);
                        // update activeIndex
                        self.activeIndex = index
                    });

                return self; // chain
            },

            /**
             * 切换当前触点
             */
            _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
                var activeTriggerCls = this.config.activeTriggerCls;

                if (fromTrigger) DOM.removeClass(fromTrigger, activeTriggerCls);
                DOM.addClass(toTrigger, activeTriggerCls);
            },

            /**
             * 切换视图
             */
            _switchView: function(fromPanels, toPanels, index, direction, ev, callback) {
                // 最简单的切换效果：直接隐藏/显示
                if (fromPanels) {
                    DOM.css(fromPanels, DISPLAY, NONE);
                }
                DOM.css(toPanels, DISPLAY, BLOCK);

                // fire onSwitch events
                this._fireOnSwitch(index, ev);
                callback && callback.call(this);
            },

            /**
             * 触发 switch 相关事件
             */
            _fireOnSwitch: function(index, ev) {

                this.fire(EVENT_SWITCH, S.mix(ev || {}, { currentIndex: index }));
            },

            /**
             * 切换到上一视图
             */
            prev: function(ev) {
                var self = this, activeIndex = self.activeIndex;
                self.switchTo(activeIndex > 0 ? activeIndex - 1 : self.length - 1, BACKWARD, ev);
            },

            /**
             * 切换到下一视图
             */
            next: function(ev) {
                var self = this, activeIndex = self.activeIndex;
                self.switchTo(activeIndex < self.length - 1 ? activeIndex + 1 : 0, FORWARD, ev);
            }
        });

    return Switchable;

}, { requires: ['dom',"event"] });

/**
 * NOTES:
 * 承玉：2011.05.10
 *   - 抽象 init plugins by Hierarchy
 *   - 抽象 init config by hierarchy
 *   - switchTo 处理，外部设置，初始展开面板
 *   - activeIndex 不可外部设置，内部使用
 *
 * 2010.07
 *  - 重构，去掉对 YUI2-Animation 的依赖
 *
 * 2010.04
 *  - 重构，脱离对 yahoo-dom-event 的依赖
 *
 * 2010.03
 *  - 重构，去掉 Widget, 部分代码直接采用 kissy 基础库
 *  - 插件机制从 weave 织入法改成 hook 钩子法
 *
 * TODO:
 *  - http://malsup.com/jquery/cycle/
 *  - http://www.mall.taobao.com/go/chn/mall_chl/flagship.php
 *  - 对 touch 设备的支持
 *
 * References:
 *  - jQuery Scrollable http://flowplayer.org/tools/scrollable.html
 *
 */
