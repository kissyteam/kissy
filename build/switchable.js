/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Aug 13 21:43
*/
/**
 * Switchable
 * @creator  玉伯<lifesinger@gmail.com>,yiminghe@gmail.com
 */
KISSY.add('switchable/base', function(S, DOM, Event, undefined) {

    var DISPLAY = 'display',
        BLOCK = 'block',
        makeArray = S.makeArray,
        NONE = 'none',
        EventTarget = Event.Target,
        FORWARD = 'forward',
        BACKWARD = 'backward',
        DOT = '.',
        EVENT_INIT = 'init',
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        EVENT_SWITCH = 'switch',
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
         * 上一个完成动画/切换的位置
         * @type Number
         */
        //self.completedIndex

        /**
         * 当前正在动画/切换的位置,没有动画则和 completedIndex 一致
         * @type Number
         */
        self.activeIndex = self.completedIndex = config.activeIndex;

        // 设置了 activeIndex
        // 要配合设置 markup
        if (self.activeIndex > -1) {
        }
        //设置了 switchTo , activeIndex == -1
        else if (typeof config.switchTo == "number") {
        }
        // 否则，默认都为 0
        // 要配合设置位置 0 的 markup
        else {
            self.completedIndex = self.activeIndex = 0;
        }


        self._init();
        self._initPlugins();
        self.fire(EVENT_INIT);


        if (self.activeIndex > -1) {
        } else if (typeof config.switchTo == "number") {
            self.switchTo(config.switchTo);
        }
    }

    function getDomEvent(e) {
        var originalEvent = {};
        originalEvent.type = e.originalEvent.type;
        originalEvent.target = e.originalEvent.target || e.originalEvent.srcElement;
        return {originalEvent:originalEvent};
    }

    Switchable.getDomEvent = getDomEvent;

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

        activeIndex: -1, // markup 的默认激活项应与 activeIndex 保持一致，激活并不代表动画完成
        activeTriggerCls: 'ks-active',
        //switchTo: undefined,  // 初始切换到面板

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
            var self = this,
                container = self.container,
                cfg = self.config,
                nav,
                content,
                triggers = [],
                panels = [],
                n;

            switch (cfg.markupType) {
                case 0: // 默认结构
                    nav = DOM.get(DOT + cfg.navCls, container);
                    if (nav) {
                        triggers = DOM.children(nav);
                    }
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
            self.triggers = makeArray(triggers);
            self.panels = makeArray(panels);

            // get content
            self.content = content || panels[0].parentNode;
            self.nav = nav || cfg.hasTriggers && triggers[0].parentNode;
        },

        /**
         * 自动生成 triggers 的 markup
         */
        _generateTriggersMarkup: function(len) {
            var self = this,
                cfg = self.config,
                ul = DOM.create('<ul>'),
                li,
                i;

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

                    Event.on(trigger, 'click', function(e) {
                        self._onFocusTrigger(index, e);
                    });

                    if (cfg.triggerType === 'mouse') {
                        Event.on(trigger, 'mouseenter', function(e) {
                            self._onMouseEnterTrigger(index, e);
                        });
                        Event.on(trigger, 'mouseleave', function() {
                            self._onMouseLeaveTrigger(index);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index, e) {
            var self = this;
            // 重复点击
            if (!self._triggerIsValid(index)) {
                return;
            }
            this._cancelSwitchTimer(); // 比如：先悬浮，再立刻点击，这时悬浮触发的切换可以取消掉。
            self.switchTo(index, undefined, getDomEvent(e));
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index, e) {
            var self = this;
            if (!self._triggerIsValid(index)) {
                return;
            }
            var ev = getDomEvent(e);
            // 重复悬浮。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次触发。
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
            return this.activeIndex !== index;
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
                ingIndex = self.activeIndex,
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

            // switch view
            self._switchView(
                ingIndex > -1 ? panels.slice(fromIndex, fromIndex + steps) : null,
                panels.slice(toIndex, toIndex + steps),
                index,
                direction, ev, function() {
                    callback && callback.call(self, index);
                    // update activeIndex
                    self.completedIndex = index
                });

            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
            var activeTriggerCls = this.config.activeTriggerCls;

            if (fromTrigger) {
                DOM.removeClass(fromTrigger, activeTriggerCls);
            }
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
            var self = this,
                activeIndex = self.activeIndex;
            self.switchTo(activeIndex > 0 ?
                activeIndex - 1 :
                self.length - 1, BACKWARD, ev);
        },

        /**
         * 切换到下一视图
         */
        next: function(ev) {
            var self = this,
                activeIndex = self.activeIndex;
            self.switchTo(activeIndex < self.length - 1 ?
                activeIndex + 1 :
                0, FORWARD, ev);
        }
    });

    return Switchable;

}, { requires: ['dom',"event"] });

/**
 * NOTES:
 *
 * 承玉：2011.06.02 review switchable
 *
 * 承玉：2011.05.10
 *   - 抽象 init plugins by Hierarchy
 *   - 抽象 init config by hierarchy
 *   - switchTo 处理，外部设置，初始展开面板
 *   - 增加状态 completedIndex
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
 * common aria for switchable and stop autoplay if necessary
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/aria", function(S, DOM, Event, Switchable) {


    Switchable.Plugins.push({
        name:'aria',
        init:function(self) {
            if (!self.config.aria) return;

            var container = self.container;

            Event.on(container, "focusin", _contentFocusin, self);

            Event.on(container, "focusout", _contentFocusout, self);
        }
    });


    function _contentFocusin() {
        this.stop && this.stop();
        /**
         * !TODO
         * tab 到时滚动到当前
         */
    }

    function _contentFocusout() {
        this.start && this.start();
    }

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
    requires:['dom','event','./base']
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
    }

    S.extend(Accordion, Switchable, {

            _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
                var self = this,
                    cfg = self.config;
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
                return this.config.multiple ||
                    Accordion.superclass._triggerIsValid.call(this, index);
            },

            /**
             * 切换视图
             */
            _switchView: function(fromPanels, toPanels, index, direction, ev, callback) {
                var self = this,
                    cfg = self.config,
                    panel = toPanels[0];

                if (cfg.multiple) {
                    DOM.toggle(panel);
                    this._fireOnSwitch(index, ev);
                    callback && callback.call(this);
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
 *  - 支持动画
 *
 *  承玉：2011.06.02 review switchable
 *
 *  承玉：2011.05.10
 *   - review ,prepare for aria
 *
 *
 */
/**
 * accordion aria support
 * @creator yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/aria', function(S, DOM, Event, Aria, Accordion) {

    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_END = 35;
    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_TAB = 9;

//    var DOM_EVENT = {originalEvent:{target:1}};

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
                var container = self.container,
                    activeIndex = self.activeIndex;
                DOM.attr(container, "aria-multiselectable",
                    self.config.multiple ? "true" : "false");
                if (self.nav) {
                    DOM.attr(self.nav, "role", "tablist");
                }
                var triggers = self.triggers,
                    panels = self.panels;
                var i = 0;
                S.each(panels, function(panel) {
                    if (!panel.id) {
                        panel.id = S.guid("ks-accordion-tab-panel");
                    }
                });
                S.each(triggers, function(trigger) {
                    if (!trigger.id) {
                        trigger.id = S.guid("ks-accordion-tab");
                    }
                });

                S.each(triggers, function(trigger) {
                    trigger.setAttribute("role", "tab");
                    trigger.setAttribute("aria-expanded", activeIndex == i ? "true" : "false");
                    trigger.setAttribute("aria-selected", activeIndex == i ? "true" : "false");
                    trigger.setAttribute("aria-controls", panels[i].id);
                    setTabIndex(trigger, activeIndex == i ? "0" : "-1");
                    i++;
                });
                i = 0;
                S.each(panels, function(panel) {
                    var t = triggers[i];
                    panel.setAttribute("role", "tabpanel");
                    panel.setAttribute("aria-hidden", activeIndex == i ? "false" : "true");
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
        var triggers = this.triggers,
            trigger;
        S.each(triggers, function(ct) {
            if (ct == t || DOM.contains(ct, t)) {
                trigger = ct;
            }
        });
        return trigger;
    }


    function _currentPanelFromEvent(t) {
        var panels = this.panels,
            panel;
        S.each(panels, function(ct) {
            if (ct == t || DOM.contains(ct, t)) {
                panel = ct;
            }
        });
        return panel;
    }

    function getTabFromPanel(panel) {
        var triggers = this.triggers,
            panels = this.panels;
        return triggers[S.indexOf(panel, panels)];
    }

    function _currentTabByTarget(t) {
        var self = this,
            currentTarget = _currentTabFromEvent.call(self, t);
        if (!currentTarget) {
            currentTarget = getTabFromPanel.call(self,
                _currentPanelFromEvent.call(self, t))
        }
        return currentTarget;
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
        var t = e.target,
            self = this,
            currentTarget,
            triggers = self.triggers;

        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
        var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

        switch (e.keyCode) {

            case KEY_ENTER:
            case KEY_SPACE:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                    && no_modifier_pressed_flag
                    ) {

                    enter.call(self, currentTarget);
                    e.halt();
                }
                break;

            case KEY_LEFT:
            case KEY_UP:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                // 争渡读屏器阻止了上下左右键
                //&& no_modifier_pressed_flag
                    ) {
                    prev.call(self, currentTarget);
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                //&& no_modifier_pressed_flag
                    ) {
                    next.call(self, currentTarget);
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    next.call(self, currentTarget);
                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    prev.call(self, currentTarget);
                }
                break;

            case KEY_HOME:
                if (no_modifier_pressed_flag) {
                    currentTarget = _currentTabByTarget.call(self, t);
                    switchTo.call(self, 0);
                    e.halt();
                }
                break;

            case KEY_END:
                if (no_modifier_pressed_flag) {
                    currentTarget = _currentTabByTarget.call(self, t);
                    switchTo.call(self, triggers.length - 1);
                    e.halt();
                }
                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    if (e.shiftKey)
                        prev.call(self, currentTarget);
                    else
                        next.call(self, currentTarget);
                }
                break;
        }
    }

    function focusTo(nextIndex, focusNext) {
        var self = this,
            triggers = self.triggers,
            next = triggers[nextIndex];
        S.each(triggers, function(cur) {
            if (cur === next) return;
            setTabIndex(cur, "-1");
            DOM.removeClass(cur, "ks-switchable-select");
            cur.setAttribute("aria-selected", "false");
        });
        if (focusNext) {
            next.focus();
        }
        setTabIndex(next, "0");
        DOM.addClass(next, "ks-switchable-select");
        next.setAttribute("aria-selected", "true");
    }

    // trigger 焦点转移
    function prev(trigger) {
        var self = this,
            triggers = self.triggers,
            focusIndex = S.indexOf(trigger, triggers),
            nFocusIndex = focusIndex == 0
                ? triggers.length - 1 : focusIndex - 1;
        focusTo.call(self, nFocusIndex, true);
    }

    function switchTo(index) {
        focusTo.call(this, index, true)
    }


    // trigger 焦点转移
    function next(trigger) {
        var self = this,
            triggers = self.triggers,
            focusIndex = S.indexOf(trigger, triggers),
            nFocusIndex = (focusIndex == triggers.length - 1
                ? 0 : focusIndex + 1);
        focusTo.call(self, nFocusIndex, true);
    }

    function enter(trigger) {
        this.switchTo(S.indexOf(trigger, this.triggers));
    }


    // 显示 tabpanel
    function _tabSwitch(ev) {

        var domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement),
            self = this,
            multiple = self.config.multiple,
            activeIndex = ev.currentIndex,
            panels = self.panels,
            triggers = self.triggers,
            trigger = triggers[activeIndex],
            panel = panels[activeIndex];

        if (!multiple) {
            S.each(panels, function(p) {
                if (p !== panel) {
                    p.setAttribute("aria-hidden", "true");
                }
            });
            S.each(triggers, function(t) {
                if (t !== trigger) {
                    t.setAttribute("aria-hidden", "true");
                }
            });
        }

        var o = panel.getAttribute("aria-hidden");
        panel.setAttribute("aria-hidden", o == "false" ? "true" : "false");
        trigger.setAttribute("aria-expanded", o == "false" ? "false" : "true");
        focusTo.call(self, activeIndex, domEvent);
    }
},
    {
        requires:["dom","event","../aria","./base"]
    });

/**

 承玉：2011.06.02 review switchable

 2011-05-08 承玉：add support for aria & keydown

 <h2>键盘快捷键</h2>
 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签
 <li>End: 当焦点在标签时转到最后一个标签
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 **/
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

            var cfg = host.config,
                interval = cfg.interval * 1000,
                timer;

            if (!cfg.autoplay) return;

            function startAutoplay() {
                // 设置自动播放
                timer = S.later(function() {
                    if (host.paused) return;
                    // 自动播放默认 forward（不提供配置），这样可以保证 circular 在临界点正确切换
                    host.switchTo(host.activeIndex < host.length - 1 ?
                        host.activeIndex + 1 : 0,
                        'forward');
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
                // paused 可以让外部知道 autoplay 的当前状态
                host.paused = true;
            };

            host.start = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                host.paused = false;
                startAutoplay();
            };

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', host.stop, host);
                Event.on(host.container, 'mouseleave', host.start, host);
            }
        }
    });
    return Switchable;
}, { requires:["event","./base"]});
/**
 承玉：2011.06.02 review switchable
 *//**
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
 * Carousel Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/carousel/base', function(S, DOM, Event, Switchable, undefined) {

    var CLS_PREFIX = 'ks-switchable-',
        DOT = '.',
        PREV_BTN = 'prevBtn',
        NEXT_BTN = 'nextBtn',
        DOM_EVENT = {originalEvent:{target:1}};

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {

        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        // call super
        Carousel.superclass.constructor.apply(self, arguments);
    }

    Carousel.Config = {
        circular: true,
        prevBtnCls: CLS_PREFIX + 'prev-btn',
        nextBtnCls: CLS_PREFIX + 'next-btn',
        disableBtnCls: CLS_PREFIX + 'disable-btn'
    };

    Carousel.Plugins = [];

    S.extend(Carousel, Switchable, {
            /**
             * 插入 carousel 的初始化逻辑
             *
             * Carousel 的初始化逻辑
             * 增加了:
             *   self.prevBtn
             *   self.nextBtn
             */
            _init:function() {
                var self = this;
                Carousel.superclass._init.call(self);
                var cfg = self.config,
                    disableCls = cfg.disableBtnCls;

                // 获取 prev/next 按钮，并添加事件
                S.each(['prev', 'next'], function(d) {
                    var btn = self[d + 'Btn'] = DOM.get(DOT + cfg[d + 'BtnCls'], self.container);

                    Event.on(btn, 'mousedown', function(ev) {
                        ev.preventDefault();
                        if (!DOM.hasClass(btn, disableCls)) {
                            self[d](DOM_EVENT);
                        }
                    });
                });

                // 注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
                // circular = true 时，无需处理
                if (!cfg.circular) {
                    self.on('switch', function(ev) {
                        var i = ev.currentIndex,
                            disableBtn = (i === 0) ?
                                self[PREV_BTN] :
                                (i === self.length - 1) ? self[NEXT_BTN] :
                                    undefined;

                        DOM.removeClass([self[PREV_BTN], self[NEXT_BTN]], disableCls);

                        if (disableBtn) {
                            DOM.addClass(disableBtn, disableCls);
                        }
                    });
                }

                // 触发 itemSelected 事件
                Event.on(self.panels, 'click', function() {
                    self.fire('itemSelected', { item: this });
                });
            }
        });


    return Carousel;

}, { requires:["dom","event","../base"]});


/**
 * NOTES:
 *
 * 承玉：2011.06.02 review switchable
 *
 * 承玉：2011.05
 *  - 内部组件 init 覆盖父类而不是监听事件
 *
 * 2010.07
 *  - 添加对 prevBtn/nextBtn 的支持
 *  - 添加 itemSelected 事件
 *
 * TODO:
 *  - itemSelected 时，自动居中的特性
 */
/**
 * aria support for carousel
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/carousel/aria", function(S, DOM, Event, Aria, Carousel) {

//    var KEY_PAGEUP = 33;
//    var KEY_PAGEDOWN = 34;
//    var KEY_END = 35;
//    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    //var KEY_TAB = 9;

    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;
    var setTabIndex = Aria.setTabIndex;
    var DOM_EVENT = {originalEvent:{target:1}};
    var FORWARD = 'forward',
        BACKWARD = 'backward';

    function _switch(ev) {
        var self = this;
        var steps = self.config.steps;
        var index = ev.currentIndex;
        var activeIndex = self.activeIndex;
        var panels = self.panels;
        var panel = panels[index * steps];
        var triggers = self.triggers;
        var trigger = triggers[index];

        var domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement);

        // dom 事件触发
        if (domEvent
            // 初始化
            || activeIndex == -1) {

            S.each(triggers, function(t) {
                setTabIndex(t, -1);
            });

            S.each(panels, function(t) {
                setTabIndex(t, -1);
            });

            if (trigger) {
                setTabIndex(trigger, 0);
            }
            setTabIndex(panel, 0);

            //dom 事件触发时，才会进行聚焦，否则会干扰用户
            if (domEvent) {
                panel.focus();
            }
        }
    }

    function findTrigger(t) {
        var r;
        S.each(this.triggers, function(trigger) {
            if (trigger == t
                || DOM.contains(trigger, t)) {
                r = trigger;
                return false;
            }
        });
        return r;
    }

    function next(c) {
        var n = DOM.next(c),
            triggers = this.triggers;
        if (!n) {
            n = triggers[0];
        }
        setTabIndex(c, -1);
        if (n) {
            setTabIndex(n, 0);
            n.focus();
        }
    }


    function prev(c) {
        var n = DOM.prev(c),
            triggers = this.triggers;
        if (!n) {
            n = triggers[triggers.length - 1];
        }
        setTabIndex(c, -1);
        if (n) {
            setTabIndex(n, 0);
            n.focus();
        }
    }

    function _navKeydown(e) {
        var key = e.keyCode,t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findTrigger.call(this, t);
                if (c) {
                    next.call(this, c);
                    e.halt();
                }
                break;

            case KEY_UP:
            case KEY_LEFT:

                c = findTrigger.call(this, t);
                if (c) {
                    prev.call(this, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:
                c = findTrigger.call(this, t);
                if (c) {
                    this.switchTo(S.indexOf(c, this.triggers), undefined, DOM_EVENT);
                    e.halt();
                }
                break;
        }
    }

    function findPanel(t) {
        var r;
        S.each(this.panels, function(p) {
            if (p == t || DOM.contains(p, t)) {
                r = p;
                return false;
            }
        });
        return r;
    }


    function nextPanel(c) {
        var n = DOM.next(c),
            panels = this.panels;
        if (!n) {
            n = panels[0];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);

        if (checkPanel.call(this, n, FORWARD)) {
            n.focus();
        }
    }


    function prevPanel(c) {
        var n = DOM.prev(c),
            panels = this.panels;
        if (!n) {
            n = panels[panels.length - 1];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);
        if (checkPanel.call(this, n, BACKWARD)) {
            n.focus();
        }
    }

    function checkPanel(p, direction) {
        var index = S.indexOf(p, this.panels),
            steps = this.config.steps,
            dest = Math.floor(index / steps);
        // 在同一个 panel 组，立即返回
        if (dest == this.activeIndex) {
            return 1;
        }
        if (index % steps == 0 || index % steps == steps - 1) {
            //向前动画滚动中，focus，会不正常 ...
            //传递事件，动画后异步 focus
            this.switchTo(dest, direction, DOM_EVENT);
            return 0;
        }
        return 1;
    }


    function _contentKeydown(e) {

        var key = e.keyCode,
            t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findPanel.call(this, t);
                if (c) {
                    nextPanel.call(this, c);
                    e.halt();
                }
                break;


            case KEY_UP:
            case KEY_LEFT:

                c = findPanel.call(this, t);
                if (c) {
                    prevPanel.call(this, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:

                c = findPanel.call(this, t);
                if (c) {
                    this.fire('itemSelected', { item: c });
                    e.halt();
                }
                break;
        }
    }

    S.mix(Carousel.Config, {
            aria:false
        });

    Carousel.Plugins.push({
            name:"aria",
            init:function(self) {
                if (!self.config.aria) {
                    return;
                }
                var triggers = self.triggers;
                var panels = self.panels;
                var content = self.content;
                var activeIndex = self.activeIndex;

                if (!content.id) {
                    content.id = S.guid("ks-switchbale-content");
                }
                content.setAttribute("role", "listbox");
                var i = 0;
                S.each(triggers, function(t) {
                    setTabIndex(t, activeIndex == i ? "0" : "-1");
                    t.setAttribute("role", "button");
                    t.setAttribute("aria-controls", content.id);
                    i++;
                });
                i = 0;
                S.each(panels, function(t) {
                    setTabIndex(t, "-1");
                    t.setAttribute("role", "option");
                    i++;
                });

                self.on("switch", _switch, self);
                var nav = self.nav;

                if (nav) {
                    Event.on(nav, "keydown", _navKeydown, self);
                }

                Event.on(content, "keydown", _contentKeydown, self);

                var prevBtn = self['prevBtn'],
                    nextBtn = self['nextBtn'];

                if (prevBtn) {
                    setTabIndex(prevBtn, 0);
                    prevBtn.setAttribute("role", "button");
                    Event.on(prevBtn, "keydown", function(e) {
                        if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                            self.prev(DOM_EVENT);
                            e.preventDefault();
                        }
                    });
                }

                if (nextBtn) {
                    setTabIndex(nextBtn, 0);
                    nextBtn.setAttribute("role", "button");
                    Event.on(nextBtn, "keydown", function(e) {
                        if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                            self.next(DOM_EVENT);
                            e.preventDefault();
                        }
                    });
                }

            }
        });

}, {
        requires:["dom","event","../aria","./base"]
    });

/**
 承玉：2011.06.02 review switchable

 承玉:2011.05.12

 <h2>键盘快捷键</h2>
 <ul class="list">
 <li><strong>当焦点在上一页 / 下一页时</strong>
 <ul>
 <li>
 enter/space 旋转到上一屏下一屏，并且焦点转移到当前屏的第一个面板
 </li>
 </ul>
 </li>

 <li>
 <strong> 当焦点在导航圆点时</strong>
 <ul>
 <li>
 上/左键：焦点转移到上一个导航圆点
 </li>
 <li>
 下/右键：焦点转移到下一个导航圆点
 </li>
 <li>
 enter/space: 旋转到当前导航圆点代表的滚动屏，并且焦点转移到当前屏的第一个面板
 </li>
 </ul>
 </li>


 <li>
 <strong>当焦点在底部滚动屏某个面板时</strong>
 <ul>
 <li>
 上/左键：焦点转移到上一个面板，必要时滚屏
 </li>
 <li>
 下/右键：焦点转移到下一个面板，必要时滚屏
 </li>
 <li>
 enter/space: 触发 itemSelect 事件，item 为当前面板
 </li>
 </ul>
 </li>
 </ul>
 **//**
 * Switchable Effect Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/effect', function(S, DOM, Event, Anim, Switchable, undefined) {

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
            callback && callback();
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
                // 不执行回调
                self.anim.stop();
                // 防止上个未完，放在最下层
                DOM.css(self.anim.fromEl, {
                        zIndex: 1,
                        opacity:0
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
                    function() {
                        self.anim = undefined; // free
                        // 切换 z-index
                        DOM.css(toEl, Z_INDEX, 9);
                        DOM.css(fromEl, Z_INDEX, 1);
                        callback && callback();
                    }, cfg.nativeAnim).run();
                self.anim.toEl = toEl;
                self.anim.fromEl = fromEl;
            } else {
                //初始情况下没有必要动画切换
                DOM.css(toEl, Z_INDEX, 9);
                callback && callback();
            }
        },

        // 水平/垂直滚动效果
        scroll: function(fromEls, toEls, callback, index) {
            var self = this,
                cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * index,
                props = { };

            props[isX ? LEFT : TOP] = -diff + PX;

            if (self.anim) {
                self.anim.stop();
            }
            if (fromEls) {
                self.anim = new Anim(self.content, props,
                    cfg.duration,
                    cfg.easing,
                    function() {
                        self.anim = undefined; // free
                        callback && callback();
                    }, cfg.nativeAnim).run();
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
    Switchable.Plugins.push({

            name: 'effect',

            /**
             * 根据 effect, 调整初始状态
             */
            init: function(host) {
                var cfg = host.config,
                    effect = cfg.effect,
                    panels = host.panels,
                    content = host.content,
                    steps = cfg.steps,
                    activeIndex = host.activeIndex,
                    len = panels.length;

                // 1. 获取高宽
                host.viewSize = [
                    cfg.viewSize[0] || panels[0].offsetWidth * steps,
                    cfg.viewSize[1] || panels[0].offsetHeight * steps
                ];
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

                var self = this,
                    cfg = self.config,
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
 * 承玉：2011.06.02 review switchable
 */
/**
 * Switchable Circular Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/circular', function(S, DOM, Anim, Switchable) {

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
            circular: false
        });

    /**
     * 循环滚动效果函数
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this,
            cfg = self.config,
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

        if (self.anim) {
            self.anim.stop();
        }

        if (fromEls) {
            self.anim = new Anim(self.content,
                props,
                cfg.duration,
                cfg.easing,
                function() {
                    if (isCritical) {
                        // 复原位置
                        resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
                    }
                    // free
                    self.anim = undefined;
                    callback && callback();
                }, cfg.nativeAnim).run();
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
            to = (start + 1) * steps,
            i;

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

}, { requires:["dom","anim","./base","./effect"]});

/**
 * 承玉：2011.06.02 review switchable
 *
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 */
/**
 * Switchable Countdown Plugin
 * @creator  gonghao<gonghao@ghsky.com>
 */
KISSY.add('switchable/countdown', function(S, DOM, Event, Anim, Switchable, undefined) {

    var CLS_PREFIX = 'ks-switchable-trigger-',
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
                        '<div class="' + TRIGGER_CONTENT_CLS + '">' +
                        trigger.innerHTML + '</div>';
                    masks[i] = trigger.firstChild;
                });

                // 鼠标悬停，停止自动播放
                if (cfg.pauseOnHover) {
                    Event.on(host.container, 'mouseenter', function() {
                        // 先停止未完成动画
                        stopAnim();

                        // 快速平滑回退到初始状态
                        var mask = masks[host.activeIndex];
                        if (fromStyle) {
                            anim = new Anim(mask, fromStyle, .2, 'easeOut').run();
                        } else {
                            DOM.attr(mask, STYLE, "");
                        }
                    });

                    Event.on(host.container, 'mouseleave', function() {
                        // 鼠标离开时立即停止未完成动画
                        stopAnim();
                        var index = host.activeIndex;

                        // 初始化动画参数，准备开始新一轮动画
                        // 设置初始样式
                        DOM.attr(masks[index], STYLE, fromStyle);

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
                    if (masks[host.activeIndex]) {
                        DOM.attr(masks[host.activeIndex], STYLE, fromStyle || "");
                    }
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

                /**
                 * 开始第一个倒计时
                 */
                if (host.activeIndex > -1) {
                    startAnim(host.activeIndex);
                }


            }
        });

    return Switchable;

}, { requires:["dom","event","anim","./base"]});
/**
 * 承玉：2011.06.02 review switchable
 *//**
 * Switchable Lazyload Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/lazyload', function(S, DOM, Switchable) {

    var EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img',
        AREA_DATA = 'textarea',
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
                    type, flag;
                if (cfg.lazyDataType === 'img-src') cfg.lazyDataType = IMG_SRC;
                if (cfg.lazyDataType === 'area-data') cfg.lazyDataType = AREA_DATA;
                
                type = cfg.lazyDataType;
                flag = FLAGS[type];
                // 没有延迟项
                if (!DataLazyload || !type || !flag) {
                    return;
                }

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
                    var elems,
                        isImgSrc = type === IMG_SRC,
                        tagName = isImgSrc ? 'img' : (type === AREA_DATA ? 'textarea' : '');

                    if (tagName) {
                        elems = DOM.query(tagName, host.container);
                        for (var i = 0,len = elems.length; i < len; i++) {
                            var el = elems[i];
                            if (isImgSrc ?
                                DOM.attr(el, flag) :
                                DOM.hasClass(el, flag)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            }
        });

    return Switchable;

}, { requires:["dom","./base"]});
/**
 * 承玉：2011.06.02 review switchable
 *//**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/slide/base', function(S, Switchable) {



    /**
     * Slide Class
     * @constructor
     */
    function Slide(container, config) {

        var self = this;

        // factory or constructor
        if (!(self instanceof Slide)) {
            return new Slide(container, config);
        }

        Slide.superclass.constructor.apply(self, arguments);
    }

    Slide.Config={
        autoplay: true,
        circular: true
    };

    Slide.Plugins=[];

    S.extend(Slide, Switchable);

    return Slide;

}, { requires:["../base"]});

/**
 * 承玉：2011.06.02 review switchable
 */
/**
 * aria support for slide
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/slide/aria", function(S, DOM, Event, Aria, Slide) {

//    var KEY_PAGEUP = 33;
//    var KEY_PAGEDOWN = 34;
//    var KEY_END = 35;
//    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    // var KEY_TAB = 9;

    // var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    // var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

    S.mix(Slide.Config, {
            aria:false
        });

    var DOM_EVENT = {originalEvent:{target:1}};

    var setTabIndex = Aria.setTabIndex;
    Slide.Plugins.push({
            name:"aria",
            init:function(self) {
                if (!self.config.aria) return;
                var triggers = self.triggers;
                var panels = self.panels;
                var i = 0;
                var activeIndex = self.activeIndex;
                S.each(triggers, function(t) {
                    setTabIndex(t, "-1");
                    i++;
                });
                i = 0;
                S.each(panels, function(p) {
                    setTabIndex(p, activeIndex == i ? "0" : "-1");
                    DOM.attr(p, "role", "option");
                    i++;
                });

                var content = self.content;

                DOM.attr(content, "role", "listbox");

                Event.on(content, "keydown", _contentKeydownProcess, self);

                setTabIndex(panels[0], 0);

                self.on("switch", function(ev) {
                    var index = ev.currentIndex,
                        domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement),
                        last = self.completedIndex;

                    if (last > -1) {
                        setTabIndex(panels[last], -1);
                    }
                    setTabIndex(panels[index], 0);

                    //dom 触发的事件，自动聚焦
                    if (domEvent) {
                        panels[index].focus();
                    }
                });
            }
        });

    function _contentKeydownProcess(e) {
        var self = this,
            key = e.keyCode;
        switch (key) {

            case KEY_DOWN:
            case KEY_RIGHT:
                self.next(DOM_EVENT);
                e.halt();
                break;

            case KEY_UP:
            case KEY_LEFT:
                self.prev(DOM_EVENT);
                e.halt();
                break;
        }
    }

}, {
        requires:["dom","event","../aria",'./base']
    });
/**
 2011-05-12 承玉：add support for aria & keydown

 <h2>键盘操作</h2>
 <ul class="list">
 <li>tab 进入卡盘时，停止自动播放</li>
 <li>上/左键：当焦点位于卡盘时，切换到上一个 slide 面板</li>
 <li>下/右键：当焦点位于卡盘时，切换到下一个 slide 面板</li>
 <li>tab 离开卡盘时，开始自动播放</li>
 </ul>
 **//**
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
KISSY.add('switchable/tabs/aria', function(S, DOM, Event,Switchable, Aria, Tabs) {

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
                    activeIndex = self.activeIndex,
                    panels = self.panels;
                var container = self.container;
                if (self.nav) {
                    DOM.attr(self.nav, "role", "tablist");
                }
                var i = 0;
                S.each(triggers, function(trigger) {
                    trigger.setAttribute("role", "tab");
                    setTabIndex(trigger, activeIndex == i ? "0" : "-1");
                    if (!trigger.id) {
                        trigger.id = S.guid("ks-switchable");
                    }
                    i++;
                });
                i = 0;
                S.each(panels, function(panel) {
                    var t = triggers[i];
                    panel.setAttribute("role", "tabpanel");
                    panel.setAttribute("aria-hidden", activeIndex == i ? "false" : "true");
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
        var triggers = this.triggers,
            trigger;
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

    var getDomEvent=Switchable.getDomEvent;

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
                    self.prev(getDomEvent(e));
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if (_currentTabFromEvent.call(self, t)
                //&& no_modifier_pressed_flag
                    ) {
                    self.next(getDomEvent(e));
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:

                if (control_modifier_pressed_flag) {
                    e.halt();
                    self.next(getDomEvent(e));
                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    self.prev(getDomEvent(e));
                }
                break;

            case KEY_HOME:
                if (no_modifier_pressed_flag) {
                    self.switchTo(0, undefined, getDomEvent(e));
                    e.halt();
                }
                break;
            case KEY_END:
                if (no_modifier_pressed_flag) {
                    self.switchTo(triggers.length - 1, undefined, getDomEvent(e));
                    e.halt();
                }

                break;
            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    if (e.shiftKey)
                        self.prev(getDomEvent(e));
                    else
                        self.next(getDomEvent(e));
                }
                break;
        }
    }

    function _tabSwitch(ev) {
        var domEvent = !!(ev.originalEvent.target||ev.originalEvent.srcElement);

        var self = this;
        // 上一个激活 tab
        var lastActiveIndex = self.completedIndex;

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

        // move focus to current trigger if invoked by dom event
        if (domEvent) {
            trigger.focus();
        }
        if (lastPanel) {
            lastPanel.setAttribute("aria-hidden", "true");
        }
        panel.setAttribute("aria-hidden", "false");
    }


},
    {
        requires:["dom","event","../base","../aria","./base"]
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
