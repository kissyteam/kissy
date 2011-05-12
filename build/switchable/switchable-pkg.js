/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
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
        CLS_PREFIX = 'ks-switchable-';

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
         * 当前激活的 index，内部使用，不可外部设置
         * @type Number
         */
        self.activeIndex = config.activeIndex = -1;

        /**
         * 正打算激活的 index，内部使用，不可外部设置
         * 一般和 activeIndex 相同，有动画时，则有落差
         */
        self.ingIndex = -1;

        self._init();
        self._initPlugins();
        self.fire(EVENT_INIT);
        // 切换到指定项
        if (S.isNumber(config.switchTo)) {
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

                    Event.on(trigger, 'click', function(ev) {
                        self._onFocusTrigger(index, ev);
                    });

                    if (cfg.triggerType === 'mouse') {
                        Event.on(trigger, 'mouseenter', function(ev) {
                            self._onMouseEnterTrigger(index, ev);
                        });
                        Event.on(trigger, 'mouseleave', function(ev) {
                            self._onMouseLeaveTrigger(index, ev);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index, ev) {
            var self = this;
            if (!self._triggerIsValid(index)) return; // 重复点击

            this._cancelSwitchTimer(); // 比如：先悬浮，再立刻点击，这时悬浮触发的切换可以取消掉。
            self.switchTo(index, undefined, ev);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index, ev) {
            var self = this;
            if (!self._triggerIsValid(index)) {
                return;
            } // 重复悬浮。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次触发。

            self.switchTimer = S.later(function() {
                self.switchTo(index, undefined, ev);
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
        prev: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex > 0 ? activeIndex - 1 : self.length - 1, BACKWARD);
        },

        /**
         * 切换到下一视图
         */
        next: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex < self.length - 1 ? activeIndex + 1 : 0, FORWARD);
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
/**
 * common aria for switchable
 */
KISSY.add("switchable/aria", function(S, DOM) {
    var default_focus = ["a","input","button","object"];
    var oriTabIndex = "oriTabIndex";
    return {

        setTabIndex:function(root, v) {
            root.tabIndex = v;
            DOM.query("*", root).each(function(n) {
                var nodeName = n.nodeName.toLowerCase();
                // a 需要被禁止或者恢复
                if (S.inArray(nodeName, default_focus)) {
                    if (!DOM.hasAttr(n, oriTabIndex)) {
                        DOM.attr(n, oriTabIndex, n.tabIndex)
                    }
                    //恢复原来
                    if (v != -1) {
                        n.tabIndex = DOM.attr(n, oriTabIndex);
                    } else {
                        n.tabIndex = v;
                    }
                }
            });
        }
    };

}, {
    requires:['dom']
});/**
 * Accordion Widget
 * @creator  沉鱼<fool2fish@gmail.com>,yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/base', function(S, DOM, Switchable) {


    /**
     * Accordion Class
     * @constructor
     */
    function Accordion(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Accordion)) {
            return new Accordion(container, config);
        }

        Accordion.superclass.constructor.apply(self, arguments);
        return 0;
    }

    S.extend(Accordion, Switchable, {

        _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
            var self = this, cfg = self.config;
            if (cfg.multiple) {
                DOM.toggleClass(toTrigger, cfg.activeTriggerCls);
            } else {
                Accordion.superclass._switchTrigger.apply(self, arguments);
            }
        },

        /**
         * 重复触发时的有效判断
         */
        _triggerIsValid: function(index) {
            // multiple 模式下，再次触发意味着切换展开/收缩状态
            return Accordion.superclass._triggerIsValid.call(this, index)
                || this.config.multiple;
        },

        /**
         * 切换视图
         */
        _switchView: function(fromPanels, toPanels, index, direction, ev, callback) {
            var self = this, cfg = self.config,
                panel = toPanels[0];

            if (cfg.multiple) {
                DOM.toggle(panel);
                this._fireOnSwitch(index, ev);
                callback.call(this);
            } else {
                Accordion.superclass._switchView.apply(self, arguments);
            }
        }
    });

    Accordion.Plugins = [];
    Accordion.Config = {
        markupType: 1,
        triggerType: 'click',
        multiple: false
    };
    return Accordion;

}, { requires:["dom","../base"]});

/**
 * TODO:
 *
 *  - 支持动画
 *
 *  承玉：2011.05.10
 *   - review ,prepare for aria
 *
 */
/**
 * accordion aria support
 * @creator yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/aria', function(S, Aria, Accordion) {
    var SELECT = "ks-switchable-select";
    var Event = S.Event,DOM = S.DOM;
    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_END = 35;
    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_TAB = 9;

    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

    S.mix(Accordion.Config, {
        aria:true
    });

    Accordion.Plugins.push({
        name:"aria",
        init:function(self) {
            if (!self.config.aria) return;
            var container = self.container;
            DOM.attr(container, "aria-multiselectable",
                self.config.multiple ? "true" : "false");
            DOM.attr(container, "role", "tablist");
            var triggers = self.triggers,
                panels = self.panels;
            var i = 0;
            S.each(panels, function(panel) {
                if (!panel.id) {
                    panel.id = S.guid("ks-switchable-tab-panel");
                }
            });
            S.each(triggers, function(trigger) {
                if (!trigger.id) {
                    trigger.id = S.guid("ks-switchable-tab");
                }
            });

            S.each(triggers, function(trigger) {
                trigger.setAttribute("role", "tab");
                trigger.setAttribute("aria-expanded", "false");
                trigger.setAttribute("aria-selected", "false");
                trigger.setAttribute("aria-controls", panels[i].id);
                setTabIndex(trigger, "-1");

                i++;
            });
            i = 0;
            S.each(panels, function(panel) {
                var t = triggers[i];
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-hidden", "true");
                panel.setAttribute("aria-labelledby", t.id);
                i++;
            });

            self.on("switch", _tabSwitch, self);


            Event.on(container, "keydown", _tabKeydown, self);
            /**
             * prevent firefox native tab switch
             */
            Event.on(container, "keypress", _tabKeypress, self);

        }
    });

    var setTabIndex = Aria.setTabIndex;

    function _currentTabFromEvent(t) {
        var triggers = this.triggers,trigger;
        S.each(triggers, function(ct) {
            if (ct == t || DOM.contains(ct, t)) {
                trigger = ct;
            }
        });
        return trigger;
    }

//
//    function _currentPanelFromEvent(t) {
//        var panels = this.panels,panel;
//        S.each(panels, function(ct) {
//            if (ct == t || DOM.contains(ct, t)) {
//                panel = ct;
//            }
//        });
//        return panel;
//    }

    function _tabKeypress(e) {

        switch (e.keyCode) {

            case KEY_PAGEUP:
            case KEY_PAGEDOWN:
                if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                    e.halt();
                } // endif
                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                } // endif
                break;

        }
    }

    /**
     * Keyboard commands for the Tab Panel
     * @param e
     */
    function _tabKeydown(e) {
        var t = e.target,self = this;
        var triggers = self.triggers;

        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
        var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

        switch (e.keyCode) {

            case KEY_ENTER:
            case KEY_SPACE:
                if (_currentTabFromEvent.call(self, t)
                    && no_modifier_pressed_flag
                    ) {
                    enter.call(self);
                    e.halt();
                }
                break;

            case KEY_LEFT:
            case KEY_UP:
                if (_currentTabFromEvent.call(self, t)
                // 争渡读屏器阻止了上下左右键
                //&& no_modifier_pressed_flag
                    ) {
                    prev.call(self);
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if (_currentTabFromEvent.call(self, t)
                //&& no_modifier_pressed_flag
                    ) {
                    next.call(self);
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:

                if (control_modifier_pressed_flag) {
                    e.halt();
                    next.call(self);

                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    prev.call(self);

                }
                break;

            case KEY_HOME:
                if (no_modifier_pressed_flag) {
                    switchTo.call(self, 0);
                    e.halt();
                }

                break;
            case KEY_END:
                if (no_modifier_pressed_flag) {
                    switchTo.call(self, triggers.length - 1);
                    e.halt();
                }

                break;
            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    if (e.shiftKey)
                        prev.call(self);
                    else
                        next.call(self);

                }
                break;
        }
    }

    function focusTo(pre, nextIndex) {
        var self = this,triggers = self.triggers;
        if (S.isNumber(pre)) {
            var cur = triggers[pre];
        }
        var next = triggers[nextIndex];
        if (cur) {
            setTabIndex(cur, "-1");
            DOM.removeClass(cur, SELECT);
            cur.setAttribute("aria-selected", "false");
            next.focus();
        }
        setTabIndex(next, "0");
        DOM.addClass(next, SELECT);
        next.setAttribute("aria-selected", "true");
    }

    // trigger 焦点转移
    function prev() {
        var self = this,
            triggers = self.triggers,
            focusIndex = self.focusIndex,
            nFocusIndex = self.focusIndex = focusIndex == 0
                ? triggers.length - 1 : focusIndex - 1;
        focusTo.call(self, focusIndex, nFocusIndex);
    }

    function switchTo(index) {
        var self = this,
            focusIndex = self.focusIndex;
        self.focusIndex = index;
        focusTo.call(self, focusIndex, index)
    }


    // trigger 焦点转移
    function next() {
        var self = this,
            triggers = self.triggers,
            focusIndex = self.focusIndex,
            nFocusIndex = self.focusIndex = (focusIndex == triggers.length - 1
                ? 0 : focusIndex + 1);
        focusTo.call(self, focusIndex, nFocusIndex);
    }

    function enter() {
        this.switchTo(this.focusIndex);
    }


    // 显示 tabpanel
    function _tabSwitch(ev) {

        var self = this,
            multiple = self.config.multiple,
            lastActiveIndex = self.activeIndex,
            activeIndex = ev.currentIndex,
            trigger = self.triggers[activeIndex],
            panel = self.panels[activeIndex];

        if (lastActiveIndex > -1) {
            var lastTrigger = self.triggers[lastActiveIndex],
                lastPanel = self.panels[lastActiveIndex];
            setTabIndex(lastTrigger, "-1");
            //初次不聚焦
            trigger.focus();
            if (!multiple) {
                lastPanel.setAttribute("aria-hidden", "true");
                lastTrigger.setAttribute("aria-expanded", "false");
            }
        }

        setTabIndex(trigger, "0");
        var o = panel.getAttribute("aria-hidden");
        panel.setAttribute("aria-hidden", o == "false" ? "true" : "false");
        trigger.setAttribute("aria-expanded", o == "false" ? "false" : "true");
        focusTo.call(self, self.focusIndex, activeIndex);
        self.focusIndex = activeIndex;
    }


},
{
    requires:["../aria","./base"]
});

/**
 * 2011-05-08 承玉：add support for aria & keydown
 * <h2>键盘快捷键</h2>

 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签
 <li>End: 当焦点在标签时转到最后一个标签
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 */
/**
 * Switchable Autoplay Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/autoplay', function(S, Event, Switchable, undefined) {


    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        autoplay: false,
        interval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 添加插件
     * attached members:
     *   - this.paused
     */
    Switchable.Plugins.push({

        name: 'autoplay',

        init: function(host) {

            var cfg = host.config, interval = cfg.interval * 1000, timer;
            if (!cfg.autoplay) return;

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', function() {
                    host.stop();
                });
                Event.on(host.container, 'mouseleave', function() {
                    host.start();
                });
            }

            function startAutoplay() {
                // 设置自动播放
                timer = S.later(function() {
                    if (host.paused) return;
                    // 自动播放默认 forward（不提供配置），这样可以保证 circular 在临界点正确切换
                    host.switchTo(host.activeIndex < host.length - 1 ? host.activeIndex + 1 : 0, 'forward');
                }, interval, true);
            }

            // go
            startAutoplay();

            // 添加 stop 方法，使得外部可以停止自动播放
            host.stop = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                host.paused = true; // paused 可以让外部知道 autoplay 的当前状态
                S.log("stop");
            };

            host.start = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                host.paused = false;
                S.log("start");
                startAutoplay();

            };
        }
    });
    return Switchable;
}, { requires:["event","./base"]});/**
 * Switchable Autorender Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/autorender', function(S,DOM,JSON,Switchable) {

    /**
     * 自动渲染 container 元素内的所有 Switchable 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="Tabs" data-widget-config="{...}">
     */
    Switchable.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        DOM.query(hook, container).each(function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;
            if (type && ('Switchable Tabs Slide Carousel Accordion'.indexOf(type) > -1)) {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    new S[type](elem, JSON.parse(config));
                } catch(ex) {
                    S.log('Switchable.autoRender: ' + ex, 'warn');
                }
            }
        });
    }

}, { requires:["dom","json","switchable/base"]});
/**
 * Switchable Effect Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/effect', function(S, DOM, Event, Anim, Switchable, undefined) {

    var
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        OPACITY = 'opacity', Z_INDEX = 'z-index',
        POSITION = 'position', RELATIVE = 'relative', ABSOLUTE = 'absolute',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly', FADE = 'fade',
        LEFT = 'left', TOP = 'top', FLOAT = 'float', PX = 'px',
        Effects;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: 'easeNone', // easing method
        nativeAnim: true
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function(fromEls, toEls, callback) {
            if (fromEls) {
                DOM.css(fromEls, DISPLAY, NONE);
            }
            DOM.css(toEls, DISPLAY, BLOCK);
            callback();
        },

        // 淡隐淡现效果
        fade: function(fromEls, toEls, callback) {
            if (fromEls) {
                if (fromEls.length !== 1) {
                    S.error('fade effect only supports steps == 1.');
                }
            }

            var self = this,
                cfg = self.config,
                fromEl = fromEls ? fromEls[0] : null,
                toEl = toEls[0];

            if (self.anim) {
                var el = self.anim.domEl;
                S.log("stop:");

                self.anim.stop();
//                S.log("stop : ");
              S.log( (S.indexOf(el, DOM.children(el.parentNode))));
            }

            // 首先显示下一张
            DOM.css(toEl, OPACITY, 1);

//            S.log("from:");
//            S.log(fromEl);
//            S.log("to:");
//            S.log(toEl);

            if (fromEl) {
                // 动画切换
                self.anim = new Anim(fromEl, { opacity: 0 }, cfg.duration, cfg.easing, function() {
                    self.anim = undefined; // free

                    // 切换 z-index
                    DOM.css(toEl, Z_INDEX, 9);
                    DOM.css(fromEl, Z_INDEX, 1);

                    callback && callback();
                    S.log("anim callback : " +
                        (S.indexOf(toEl, DOM.children(toEl.parentNode))));
                }, cfg.nativeAnim).run();
            } else {
                DOM.css(toEl, Z_INDEX, 9);
                callback && callback();
            }
        },

        // 水平/垂直滚动效果
        scroll: function(fromEls, toEls, callback, index) {
            var self = this, cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * index,
                props = { };

            props[isX ? LEFT : TOP] = -diff + PX;

            if (self.anim) {
                self.anim.stop();
            }

            self.anim = new Anim(self.content, props, cfg.duration, cfg.easing, function() {
                self.anim = undefined; // free
                callback();
            }, cfg.nativeAnim).run();

        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * 添加插件
     * attached members:
     *   - this.viewSize
     */
    Switchable.Plugins.push({

        name: 'effect',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function(host) {
            var cfg = host.config, effect = cfg.effect,
                panels = host.panels, content = host.content,
                steps = cfg.steps,
                activeIndex = host.activeIndex,
                len = panels.length;

            // 1. 获取高宽
            host.viewSize = [
                cfg.viewSize[0] || panels[0].offsetWidth * steps,
                cfg.viewSize[1] || panels[0].offsetHeight * steps
            ];
            // 注：所有 panel 的尺寸应该相同
            //    最好指定第一个 panel 的 width 和 height, 因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (effect !== NONE) { // effect = scrollx, scrolly, fade

                // 这些特效需要将 panels 都显示出来
                S.each(panels, function(panel) {
                    DOM.css(panel, DISPLAY, BLOCK);
                });

                switch (effect) {
                    // 如果是滚动效果
                    case SCROLLX:
                    case SCROLLY:

                        // 设置定位信息，为滚动效果做铺垫
                        DOM.css(content, POSITION, ABSOLUTE);

                        DOM.css(content.parentNode, POSITION, RELATIVE); // 注：content 的父级不一定是 container

                        // 水平排列
                        if (effect === SCROLLX) {
                            DOM.css(panels, FLOAT, LEFT);

                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            DOM.width(content, host.viewSize[0] * (len / steps));
                        }
                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        var min = activeIndex * steps,
                            max = min + steps - 1,
                            isActivePanel;

                        S.each(panels, function(panel, i) {
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

        _switchView: function(fromEls, toEls, index, direction, ev, callback) {

            var self = this, cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, fromEls, toEls, function() {
                self._fireOnSwitch(index, ev);
                callback && callback.call(self);
            }, index, direction);
        }

    });

    return Switchable;

}, { requires:["dom","event","anim","switchable/base"]});
/**
 * Switchable Circular Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/circular', function(S,DOM, Anim,Switchable) {

    var POSITION = 'position', RELATIVE = 'relative',
        LEFT = 'left', TOP = 'top',
        EMPTY = '', PX = 'px',
        FORWARD = 'forward', BACKWARD = 'backward',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    /**
     * 循环滚动效果函数
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this, cfg = self.config,
            len = self.length,
            activeIndex = self.activeIndex,
            isX = cfg.scrollType === SCROLLX,
            prop = isX ? LEFT : TOP,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            props = {},
            isCritical,
            isBackward = direction === BACKWARD;

        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && activeIndex === 0 && index === len - 1)
            || (direction === FORWARD && activeIndex === len - 1 && index === 0);

        if (isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
        }
        props[prop] = diff + PX;

        // 开始动画

        if (self.anim) self.anim.stop();

        self.anim = new Anim(self.content, props, cfg.duration, cfg.easing, function() {
            if (isCritical) {
                // 复原位置
                resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
            }
            // free
            self.anim = undefined;
            callback();
        }, cfg.nativeAnim).run();

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
        for (i = from; i < to; i++) {
            DOM.css(panels[i], POSITION, RELATIVE);
            DOM.css(panels[i], prop, (isBackward ? -1 : 1) * viewDiff * len);
        }

        // 偏移量
        return isBackward ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 滚动完成后，复位到正常状态
        for (i = from; i < to; i++) {
            DOM.css(panels[i], POSITION, EMPTY);
            DOM.css(panels[i], prop, EMPTY);
        }

        // 瞬移到正常位置
        DOM.css(self.content, prop, isBackward ? -viewDiff * (len - 1) : EMPTY);
    }

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name: 'circular',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function(host) {
            var cfg = host.config;

            // 仅有滚动效果需要下面的调整
            if (cfg.circular && (cfg.effect === SCROLLX || cfg.effect === SCROLLY)) {
                // 覆盖滚动效果函数
                cfg.scrollType = cfg.effect; // 保存到 scrollType 中
                cfg.effect = circularScroll;
            }
        }
    });

}, { requires:["dom","anim","switchable/base","switchable/effect"]});

/**
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 */
/**
 * Switchable Countdown Plugin
 * @creator  gonghao<gonghao@ghsky.com>
 */
KISSY.add('switchable/countdown', function(S, DOM, Event, Anim, Switchable, undefined) {

    var
        CLS_PREFIX = 'ks-switchable-trigger-',
        TRIGGER_MASK_CLS = CLS_PREFIX + 'mask',
        TRIGGER_CONTENT_CLS = CLS_PREFIX + 'content',
        STYLE = 'style';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        countdown: false,
        countdownFromStyle: '',      // 倒计时的初始样式
        countdownToStyle: 'width: 0' // 初始样式由用户在 css 里指定，配置里仅需要传入有变化的最终样式
    });

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name: 'countdown',

        init: function(host) {
            var cfg = host.config,
                animTimer,
                interval = cfg.interval,
                triggers = host.triggers,
                masks = [],
                fromStyle = cfg.countdownFromStyle,
                toStyle = cfg.countdownToStyle,
                anim;

            // 必须保证开启 autoplay 以及有 trigger 时，才能开启倒计时动画
            if (!cfg.autoplay || !cfg.hasTriggers || !cfg.countdown) return;

            // 为每个 trigger 增加倒计时动画覆盖层
            S.each(triggers, function(trigger, i) {
                trigger.innerHTML = '<div class="' + TRIGGER_MASK_CLS + '"></div>' +
                    '<div class="' + TRIGGER_CONTENT_CLS + '">' + trigger.innerHTML + '</div>';
                masks[i] = trigger.firstChild;
            });

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', function() {
                    // 先停止未完成动画
                    stopAnim();

                    // 快速平滑回退到初始状态
                    var mask = masks[host.ingIndex];
                    if (fromStyle) {
                        anim = new Anim(mask, fromStyle, .2, 'easeOut').run();
                    } else {
                        DOM.removeAttr(mask, STYLE);
                    }
                });

                Event.on(host.container, 'mouseleave', function() {
                    // 鼠标离开时立即停止未完成动画
                    stopAnim();
                    var index = host.ingIndex;
                    // 初始化动画参数，准备开始新一轮动画
                    DOM.removeAttr(masks[index], STYLE);

                    // 重新开始倒计时动画，缓冲下，避免快速滑动
                    animTimer = setTimeout(function() {
                        startAnim(index);
                    }, 200);
                });
            }

            // panels 切换前，当前 trigger 完成善后工作以及下一 trigger 进行初始化
            host.on('beforeSwitch', function() {
                // 恢复前，先结束未完成动画效果
                stopAnim();

                // 将当前 mask 恢复动画前状态
                DOM.attr(masks[host.activeIndex], STYLE, fromStyle || "");
            });

            // panel 切换完成时，开始 trigger 的倒计时动画
            host.on('switch', function(ev) {
                // 悬停状态，当用户主动触发切换时，不需要倒计时动画
                if (!host.paused) {
                    startAnim(ev.currentIndex);
                }
            });

            // 开始倒计时动画
            function startAnim(index) {
                stopAnim(); // 开始之前，先确保停止掉之前的
                anim = new Anim(masks[index],
                    toStyle, interval - 1).run(); // -1 是为了动画结束时停留一下，使得动画更自然
            }

            // 停止所有动画
            function stopAnim() {
                if (animTimer) {
                    clearTimeout(animTimer);
                    animTimer = null;
                }
                if (anim) {
                    anim.stop();
                    anim = undefined;
                }
            }
        }
    });

    return Switchable;

}, { requires:["dom","event","anim","switchable/base"]});

/**
 * NOTES:
 *
 *  - 2010/08/09: [yubo] 在 firefox 下 cpu 占用较高，暂不考虑。等 CSS3 普及了，再用 CSS3 来改造。
 */
/**
 * Switchable Lazyload Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/lazyload', function(S,DOM,Switchable) {

    var EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img-src',
        AREA_DATA = 'area-data',
        FLAGS = { };

    FLAGS[IMG_SRC] = 'data-ks-lazyload-custom';
    FLAGS[AREA_DATA] = 'ks-datalazyload-custom';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        lazyDataType: AREA_DATA // or IMG_SRC
    });

    /**
     * 织入初始化函数
     */
    Switchable.Plugins.push({

        name: 'lazyload',

        init: function(host) {
            var DataLazyload = S.require("datalazyload"),
                cfg = host.config,
                type = cfg.lazyDataType, flag = FLAGS[type];

            if (!DataLazyload || !type || !flag) return; // 没有延迟项

            host.on(EVENT_BEFORE_SWITCH, loadLazyData);

            /**
             * 加载延迟数据
             */
            function loadLazyData(ev) {
                var steps = cfg.steps,
                    from = ev.toIndex * steps ,
                    to = from + steps;

                DataLazyload.loadCustomLazyData(host.panels.slice(from, to), type);
                if (isAllDone()) {
                    host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }

            /**
             * 是否都已加载完成
             */
            function isAllDone() {
                var elems, i, len,
                    isImgSrc = type === IMG_SRC,
                    tagName = isImgSrc ? 'img' : (type === AREA_DATA ? 'textarea' : '');

                if (tagName) {
                    elems = DOM.query(tagName, host.container);
                    for (i = 0, len = elems.length; i < len; i++) {
                        if (isImgSrc ? DOM.attr(elems[i], flag) : DOM.hasClass(elems[i], flag)) return false;
                    }
                }
                return true;
            }
        }
    });

    return Switchable;

}, { requires:["dom","switchable/base"]});/**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/tabs/base', function(S, Switchable) {
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
        return 0;
    }

    S.extend(Tabs, Switchable);

    Tabs.Config = {};
    Tabs.Plugins = [];
    return Tabs;
}, {
    requires:["../base"]
});/**
 * Tabs aria support
 * @creator yiminghe@gmail.com
 */
KISSY.add('switchable/tabs/aria', function(S, Aria, Tabs) {

    var Event = S.Event,DOM = S.DOM;
    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_END = 35;
    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_TAB = 9;

//    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
//    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

    S.mix(Tabs.Config, {
        aria:true
    });

    Tabs.Plugins.push({
        name:"aria",
        init:function(self) {
            if (!self.config.aria) return;
            var triggers = self.triggers,
                panels = self.panels;
            var container = self.container;
            DOM.attr(container, "role", "tablist");
            var i = 0;
            S.each(triggers, function(trigger) {
                trigger.setAttribute("role", "tab");
                setTabIndex(trigger, "-1");
                if (!trigger.id) {
                    trigger.id = S.guid("ks-switchable");
                }
                i++;
            });
            i = 0;
            S.each(panels, function(panel) {
                var t = triggers[i];
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-hidden", "true");
                panel.setAttribute("aria-labelledby", t.id);
                i++;
            });

            self.on("switch", _tabSwitch, self);


            Event.on(container, "keydown", _tabKeydown, self);
            /**
             * prevent firefox native tab switch
             */
            Event.on(container, "keypress", _tabKeypress, self);

        }
    });

    var setTabIndex = Aria.setTabIndex;


    function _currentTabFromEvent(t) {
        var triggers = this.triggers,trigger;
        S.each(triggers, function(ct) {
            if (ct == t || DOM.contains(ct, t)) {
                trigger = ct;
            }
        });
        return trigger;
    }

    function _tabKeypress(e) {

        switch (e.keyCode) {

            case KEY_PAGEUP:
            case KEY_PAGEDOWN:
                if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                    e.halt();
                } // endif
                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                } // endif
                break;

        }
    }

    /**
     * Keyboard commands for the Tab Panel
     * @param e
     */
    function _tabKeydown(e) {
        var t = e.target,self = this;
        var triggers = self.triggers;

        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
        var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

        switch (e.keyCode) {

            case KEY_LEFT:
            case KEY_UP:
                if (_currentTabFromEvent.call(self, t)
                // 争渡读屏器阻止了上下左右键
                //&& no_modifier_pressed_flag
                    ) {
                    self.prev();
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if (_currentTabFromEvent.call(self, t)
                //&& no_modifier_pressed_flag
                    ) {
                    self.next();
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:

                if (control_modifier_pressed_flag) {
                    e.halt();
                    e.preventDefault();
                    self.next();

                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    self.prev();

                }
                break;

            case KEY_HOME:
                if (no_modifier_pressed_flag) {
                    self.switchTo(0);
                    e.halt();
                }
                break;
            case KEY_END:
                if (no_modifier_pressed_flag) {
                    self.switchTo(triggers.length - 1);
                    e.halt();
                }

                break;
            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    if (e.shiftKey)
                        self.prev();
                    else
                        self.next();

                }
                break;
        }
    }

    function _tabSwitch(ev) {
        var self = this;
        // 上一个激活 tab
        var lastActiveIndex = self.activeIndex;

        // 当前激活 tab
        var activeIndex = ev.currentIndex;

        if (lastActiveIndex == activeIndex) return;

        var lastTrigger = self.triggers[lastActiveIndex];
        var trigger = self.triggers[activeIndex];
        var lastPanel = self.panels[lastActiveIndex];
        var panel = self.panels[activeIndex];
        if (lastTrigger) {
            setTabIndex(lastTrigger, "-1");
        }
        setTabIndex(trigger, "0");
        //初次不聚焦
        if (lastActiveIndex != -1) {
            trigger.focus();
        }
        if (lastPanel) {
            lastPanel.setAttribute("aria-hidden", "true");
        }
        panel.setAttribute("aria-hidden", "false");
    }


},
{
    requires:["../aria","./base"]
});

/**
 * 2011-05-08 承玉：add support for aria & keydown
 * <h2>键盘快捷键</h2>

 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签
 <li>End: 当焦点在标签时转到最后一个标签
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 */
KISSY.add("switchable", function(S, Switchable, Aria, Accordion, AAria, autoplay, autorender, Carousel, CAria, circular, countdown, effect, lazyload, Slide, SAria, Tabs, TAria) {
    S.Switchable = Switchable;
    var re = {
        Accordion:Accordion,
        Carousel:Carousel,
        Slide:Slide,
        Tabs:Tabs
    };
    S.mix(S, re);
    S.mix(Switchable, re);
    return Switchable;
}, {
    requires:[
        "switchable/base",
        "switchable/aria",
        "switchable/accordion/base",
        "switchable/accordion/aria",
        "switchable/autoplay",
        "switchable/autorender",
        "switchable/carousel/base",
        "switchable/carousel/aria",
        "switchable/circular",
        "switchable/countdown",
        "switchable/effect",
        "switchable/lazyload",
        "switchable/slide/base",
        "switchable/slide/aria",
        "switchable/tabs/base",
        "switchable/tabs/aria"
    ]
});
