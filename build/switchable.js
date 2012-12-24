/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:28
*/
/**
 * @fileOverview accordion aria support
 * @author yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/aria', function (S, DOM, Event, Aria, Accordion, Switchable) {

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
        aria: true
    });

    Switchable.addPlugin({
        name: "aria",
        init: function (self) {
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
            S.each(panels, function (panel) {
                if (!panel.id) {
                    panel.id = S.guid("ks-accordion-tab-panel");
                }
            });
            S.each(triggers, function (trigger) {
                if (!trigger.id) {
                    trigger.id = S.guid("ks-accordion-tab");
                }
            });

            S.each(triggers, function (trigger) {
                trigger.setAttribute("role", "tab");
                trigger.setAttribute("aria-expanded", activeIndex == i ? "true" : "false");
                trigger.setAttribute("aria-selected", activeIndex == i ? "true" : "false");
                trigger.setAttribute("aria-controls", panels[i].id);
                setTabIndex(trigger, activeIndex == i ? "0" : "-1");
                i++;
            });
            i = 0;
            S.each(panels, function (panel) {
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
    }, Accordion);

    var setTabIndex = Aria.setTabIndex;

    function _currentTabFromEvent(t) {
        var triggers = this.triggers,
            trigger = null;
        S.each(triggers, function (ct) {
            if (ct == t || DOM.contains(ct, t)) {
                trigger = ct;
            }
        });
        return trigger;
    }


    function _currentPanelFromEvent(t) {
        var panels = this.panels,
            panel = null;
        S.each(panels, function (ct) {
            if (ct == t || DOM.contains(ct, t)) {
                panel = ct;
            }
        });
        return panel;
    }

    function getTabFromPanel(panel) {
        var self = this,
            triggers = self.triggers,
            panels = self.panels;
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
        S.each(triggers, function (cur) {
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
        var self = this;
        self.switchTo(S.indexOf(trigger, self.triggers));
    }


    // 显示 tabpanel
    function _tabSwitch(ev) {

        var domEvent = ev.originalEvent && !!(ev.originalEvent.target || ev.originalEvent.srcElement),
            self = this,
            multiple = self.config.multiple,
            activeIndex = ev.currentIndex,
            panels = self.panels,
            triggers = self.triggers,
            trigger = triggers[activeIndex],
            panel = panels[activeIndex];

        if (!multiple) {
            S.each(panels, function (p) {
                if (p !== panel) {
                    p.setAttribute("aria-hidden", "true");
                }
            });
            S.each(triggers, function (t) {
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
}, {
    requires: ["dom", "event", "../aria", "./base", "../base"]
});

/**

 yiminghe@gmail.com：2011.06.02 review switchable

 2011-05-08 yiminghe@gmail.com：add support for aria & keydown

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
 * @fileOverview Accordion Widget
 * @author fool2fish@gmail.com, yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/base', function (S, DOM, Switchable) {


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

        _switchTrigger:function (fromTrigger, toTrigger) {
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
        _triggerIsValid:function (index) {
            // multiple 模式下，再次触发意味着切换展开/收缩状态
            return this.config.multiple ||
                Accordion.superclass._triggerIsValid.call(this, index);
        },

        /**
         * 切换视图
         */
        _switchView:function (direction, ev, callback) {
            var self = this,
                cfg = self.config,
                panel = self._getFromToPanels().toPanels;

            if (cfg.multiple) {
                DOM.toggle(panel);
                this._fireOnSwitch(ev);
                callback && callback.call(this);
            } else {
                Accordion.superclass._switchView.apply(self, arguments);
            }
        }
    });
    Accordion.Config = {
        markupType:1,
        triggerType:'click',
        multiple:false
    };
    return Accordion;

}, { requires:["dom", "../base"]});

/**
 * TODO:
 *  - 支持动画
 *
 *  yiminghe@gmail.com：2011.06.02 review switchable
 *
 *  yiminghe@gmail.com：2011.05.10
 *   - review ,prepare for aria
 *
 *
 */
/**
 * @fileOverview common aria for switchable and stop autoplay if necessary
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/aria", function(S, DOM, Event, Switchable) {


    Switchable.addPlugin({
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
            S.each(DOM.query("*", root),function(n) {
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
});
/**
 * @fileOverview Switchable autoplay Plugin
 */
KISSY.add('switchable/autoplay', function (S, DOM, Event, Switchable, undefined) {
    var DURATION = 200,
        win = S.Env.host,
        checkElemInViewport = function (elem) {
            // 只计算上下位置是否在可视区域, 不计算左右
            var scrollTop = DOM.scrollTop(),
                vh = DOM.viewportHeight(),
                elemOffset = DOM.offset(elem),
                elemHeight = DOM.height(elem);
            return elemOffset.top > scrollTop &&
                elemOffset.top + elemHeight < scrollTop + vh;
        };

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        // 当 Switchable 对象不在可视区域中时停止动画切换
        pauseOnScroll:false,
        autoplay:false,
        interval:5, // 自动播放间隔时间
        pauseOnHover:true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });


    /**
     * 添加插件
     * attached members:
     *   - this.paused
     */
    Switchable.addPlugin({

        name:'autoplay',

        init:function (host) {

            var cfg = host.config,
                interval = cfg.interval * 1000,
                timer;

            if (!cfg.autoplay) {
                return;
            }

            if (cfg.pauseOnScroll) {
                host.__scrollDetect = S.buffer(function () {
                    // 依次检查页面上所有 switchable 对象是否在可视区域内
                    host[checkElemInViewport(host.container) ? 'start' : 'stop']();
                }, DURATION);
                Event.on(win, "scroll", host.__scrollDetect);
            }

            function startAutoplay() {
                // 设置自动播放
                timer = S.later(function () {
                    if (host.paused) {
                        return;
                    }
                    // 自动播放默认 forward（不提供配置），这样可以保证 circular 在临界点正确切换
                    // 用户 mouseenter 不提供 forward ，全景滚动
                    host.next();
                }, interval, true);
            }

            // go
            startAutoplay();

            // 添加 stop 方法，使得外部可以停止自动播放
            host.stop = function () {

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                // paused 可以让外部知道 autoplay 的当前状态
                host.paused = true;
            };

            host.start = function () {

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
        },

        destroy:function (host) {
            if (host.__scrollDetect) {
                Event.remove(win, "scroll", host.__scrollDetect);
                host.__scrollDetect.stop();
            }
        }
    });
    return Switchable;
}, { requires:["dom", "event", "./base"]});
/**
 * - 乔花 yiminghe@gmail.com：2012.02.08 support pauseOnScroll
 *  当 Switchable 对象不在可视区域中时停止动画切换
 *
 * - yiminghe@gmail.com：2011.06.02 review switchable
 */
/**
 * @fileOverview Switchable
 */
KISSY.add('switchable/base', function (S, DOM, Event, undefined) {

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
        EVENT_BEFORE_REMOVE = 'beforeRemove',
        EVENT_ADDED = 'add',
        EVENT_REMOVED = 'remove',
        CLS_PREFIX = 'ks-switchable-',
        CLS_TRIGGER_INTERNAL = CLS_PREFIX + 'trigger-internal',
        CLS_PANEL_INTERNAL = CLS_PREFIX + 'panel-internal';

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

        self._triggerInternalCls = S.guid(CLS_TRIGGER_INTERNAL);
        self._panelInternalCls = S.guid(CLS_PANEL_INTERNAL);

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
        var host = self.constructor;

        // 子类配置优先
        while (host) {
            config = S.merge(host.Config, config);
            host = host.superclass ? host.superclass.constructor : null;
        }

        /**
         * the container of widget
         * @type {HTMLElement}
         */
        self.container = DOM.get(container);

        /**
         * 配置参数
         * @type {Object}
         */
        self.config = config;

        /**
         * triggers
         * @type {HTMLElement[]}
         */
        //self.triggers

        /**
         * panels
         * @type {HTMLElement}
         */
        //self.panels

        /**
         * length = panels.length / steps
         * @type {Number}
         */
        //self.length

        /**
         * the parentNode of panels
         * @type {HTMLElement}
         */
        //self.content

        /**
         * 当前正在动画/切换的位置
         * @type {Number}
         */
        self.activeIndex = config.activeIndex;

        var willSwitch;

        // 设置了 activeIndex
        // 要配合设置 markup
        if (self.activeIndex > -1) {
        }
        //设置了 switchTo , activeIndex == -1
        else if (typeof config.switchTo == "number") {
            willSwitch = config.switchTo;
        }
        // 否则，默认都为 0
        // 要配合设置位置 0 的 markup
        else {
            self.activeIndex = 0;
        }

        self._init();
        self._initPlugins();
        self.fire(EVENT_INIT);

        if (willSwitch !== undefined) {
            self.switchTo(willSwitch);
        }
    }

    function getCommonAncestor(nodes) {
        if (!nodes || !nodes.length) {
            return null;
        }
        else if (nodes.length == 1) {
            return nodes[0].parentNode;
        } else {
            var p = nodes[0],
                pass = 0;
            while (!pass && p != document.body) {
                p = p.parentNode;
                pass = 1;
                for (var i = 1; i < nodes.length; i++) {
                    if (!DOM.contains(p, nodes[i])) {
                        pass = 0;
                        break;
                    }
                }
            }
            return p;
        }
    }

    function getDomEvent(e) {
        var originalEvent = {};
        originalEvent.type = e.type;
        originalEvent.target = e.target;
        return {originalEvent: originalEvent};
    }

    Switchable.getDomEvent = getDomEvent;

    Switchable.addPlugin = function (cfg, Type) {

        Type = Type || Switchable;
        var priority = cfg.priority = cfg.priority || 0,
            i = 0,
            plugins = Type.Plugins = Type.Plugins || [];
        // 大的在前
        for (; i < plugins.length; i++) {
            if (plugins[i].priority < priority) {
                break;
            }
        }
        plugins.splice(i, 0, cfg);
    };

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

        /**
         * 如果 activeIndex 和 switchTo 都不设置，相当于设置了 activeIndex 为 0
         * 如果设置了 activeIndex ，则需要为对应的 panel html 添加 activeTriggerCls class
         */
        activeIndex: -1,

        activeTriggerCls: 'ks-active',

        /**
         * 初始切换到面板，设置了 switchTo 就不需要设置 activeIndex
         * 以及为对应 html 添加 activeTriggerCls class.
         * 注意： activeIndex 和 switchTo 不要同时设置，否则 activeIndex 优先
         */
        switchTo: undefined,

        // 可见视图内有多少个 panels
        steps: 1,

        // 可见视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
        viewSize: []
    };

    S.augment(Switchable, EventTarget, {

        _initPlugins: function () {
            // init plugins by Hierarchy
            var self = this,
                plugins = [],
                pluginHost = self.constructor;

            while (pluginHost) {
                if (pluginHost.Plugins) {
                    plugins.push.apply(plugins, ([].concat(pluginHost.Plugins)).reverse())
                }
                pluginHost = pluginHost.superclass ?
                    pluginHost.superclass.constructor :
                    null;
            }

            plugins.reverse();

            // 父类先初始化
            S.each(plugins, function (plugin) {
                if (plugin.init) {
                    plugin.init(self);
                }
            });

        },

        /**
         * init switchable
         */
        _init: function () {
            var self = this,
                cfg = self.config;

            // parse markup
            self._parseMarkup();

            // bind triggers
            if (cfg.hasTriggers) {
                self._bindTriggers();
            }
            // bind panels
            self._bindPanels();
        },

        /**
         * 解析 markup, 获取 triggers, panels, content
         */
        _parseMarkup: function () {
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
                    nav = cfg.nav;
                    content = cfg.content;
                    break;
            }

            // get length
            n = panels.length;

            // fix self.length 不为整数的情况, 会导致之后的判断 非0, by qiaohua 20111101
            self.length = Math.ceil(n / cfg.steps);

            self.nav = nav || cfg.hasTriggers &&
                // shop 问题， trigger 并不是兄弟关系，取 parentNode 没法代理
                getCommonAncestor(triggers);

            // 自动生成 triggers and nav
            if (cfg.hasTriggers && (
                // 指定了 navCls，但是可能没有手动填充 trigger
                !self.nav || triggers.length == 0
                )) {
                triggers = self._generateTriggersMarkup(self.length);
            }

            // 将 triggers 和 panels 转换为普通数组
            self.triggers = makeArray(triggers);
            self.panels = makeArray(panels);

            // get content
            self.content = content || getCommonAncestor(panels);

        },

        /**
         * 自动生成 triggers 的 markup
         */
        _generateTriggersMarkup: function (len) {
            var self = this,
                cfg = self.config,
                ul = self.nav || DOM.create('<ul>'),
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
            self.nav = ul;
            return DOM.children(ul);
        },

        /**
         * 给 triggers 添加事件
         */
        _bindTriggers: function () {
            var self = this,
                cfg = self.config,
                _triggerInternalCls = self._triggerInternalCls,
                navEl = self.nav,
                triggers = self.triggers;
            // 给 trigger 添加class，使用委托
            S.each(triggers, function (trigger) {
                self._initTrigger(trigger);
            });

            Event.delegate(navEl, 'click', '.' + _triggerInternalCls, function (e) {
                var trigger = e.currentTarget,
                    index = self._getTriggerIndex(trigger);
                self._onFocusTrigger(index, e);
            });

            if (cfg.triggerType === 'mouse') {
                Event.delegate(navEl, 'mouseenter', '.' + _triggerInternalCls,
                    function (e) {
                        var trigger = e.currentTarget,
                            index = self._getTriggerIndex(trigger);
                        self._onMouseEnterTrigger(index, e);
                    });
                Event.delegate(navEl, 'mouseleave', '.' + _triggerInternalCls, function () {
                    self._onMouseLeaveTrigger();
                });
            }
        },
        // 初始化 Trigger，添加样式
        _initTrigger: function (trigger) {
            DOM.addClass(trigger, this._triggerInternalCls);
        },

        _bindPanels: function () {
            var self = this,
                panels = self.panels;
            S.each(panels, function (panel) {
                self._initPanel(panel);
            });
        },

        // 初始化panel,添加class
        _initPanel: function (panel) {
            DOM.addClass(panel, this._panelInternalCls);
        },
        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function (index, e) {
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
        _onMouseEnterTrigger: function (index, e) {
            var self = this;
            if (!self._triggerIsValid(index)) {
                return;
            }
            var ev = getDomEvent(e);
            // 重复悬浮。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次触发。
            self.switchTimer = S.later(function () {
                self.switchTo(index, undefined, ev);
            }, self.config.delay * 1000);
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function () {
            this._cancelSwitchTimer();
        },

        /**
         * 重复触发时的有效判断
         */
        _triggerIsValid: function (index) {
            return this.activeIndex !== index;
        },

        /**
         * 取消切换定时器
         */
        _cancelSwitchTimer: function () {
            var self = this;
            if (self.switchTimer) {
                self.switchTimer.cancel();
                self.switchTimer = undefined;
            }
        },

        /**
         * 获取trigger的索引
         */
        _getTriggerIndex: function (trigger) {
            var self = this;
            return S.indexOf(trigger, self.triggers);
        },
        //重置 length: 代表有几个trigger
        _resetLength: function () {
            this.length = this._getLength();
        },
        //获取 Trigger的数量
        _getLength: function (panelCount) {
            var self = this,
                cfg = self.config;
            if (panelCount === undefined) {
                panelCount = self.panels.length;
            }
            return Math.ceil(panelCount / cfg.steps);
        },
        // 添加完成后，重置长度，和跳转到新添加项
        _afterAdd: function (index, active, callback) {
            var self = this;

            // 重新计算 trigger 的数目
            self._resetLength();

            // 考虑 steps>1 的情况
            var page = self._getLength(index + 1) - 1;

            // 重置当前活动项
            if (self.config.steps == 1) {
                // step =1 时 ，相同的 activeIndex 需要拍后
                if (self.activeIndex >= page) {
                    self.activeIndex += 1;
                }
            } else {
                // step >1 时 ，activeIndex 不排后
            }

            // 保持原来的在视窗
            var n = self.activeIndex;


            // 设为 -1，立即回复到原来视图
            self.activeIndex = -1;
            self.switchTo(n);


            // 需要的话，从当前视图滚动到新的视图
            if (active) {
                // 放到 index 位置
                self.switchTo(page, undefined, undefined, callback);
            } else {
                callback();
            }
        },
        /**
         * 添加一项
         * @param {Object} cfg 添加项的配置
         * @param {String|Object} cfg.trigger 导航的Trigger
         * @param {String|Object} cfg.panel 内容
         * @param {Number} cfg.index 添加到得位置
         */
        add: function (cfg) {
            var callback = cfg.callback || S.noop,
                self = this,
                navContainer = self.nav,
                contentContainer = self.content,
                triggerDom = cfg.trigger, //trigger 的Dom节点
                panelDom = cfg.panel, //panel的Dom节点
                active = cfg['active'], //添加一项后是否跳转到对应的trigger
                count = self.panels.length,
                index = cfg.index != null ? cfg.index : count,
                triggers = self.triggers,
                panels = self.panels,
                beforeLen = self.length, //添加节点之前的 trigger个数，如果step>1时，trigger 的个数不等于panel的个数
                currentLen = null,
            //原先在此位置的元素
                nextTrigger = null;

            // 如果 index 大于集合的总数，添加到最后
            index = Math.max(0, Math.min(index, count));

            var nextPanel = panels[index] || null;
            panels.splice(index, 0, panelDom);
            // 插入content容器对应的位置
            contentContainer.insertBefore(panelDom, nextPanel);
            // 当trigger 跟panel一一对应时，插入对应的trigger
            if (self.config.steps == 1) {
                nextTrigger = triggers[index];
                // 插入导航对应的位置
                navContainer.insertBefore(triggerDom, nextTrigger);
                // 插入集合
                triggers.splice(index, 0, triggerDom);
            } else {
                // 否则，多个 panel 对应一个 trigger 时，在最后附加 trigger
                currentLen = self._getLength();
                if (currentLen != beforeLen) {
                    // 附加到导航容器
                    DOM.append(triggerDom, navContainer);
                    triggers.push(triggerDom);
                }
            }

            self._initPanel(panelDom);
            self._initTrigger(triggerDom);

            self._afterAdd(index, active, callback);
            // 触发添加事件
            self.fire(EVENT_ADDED, {
                index: index,
                trigger: triggerDom,
                panel: panelDom
            });
        },

        /**
         * 移除一项
         */
        remove: function (cfg) {

            var callback = cfg.callback || S.noop,
                self = this,
                steps = self.config.steps,
                beforeLen = self.length,
                index,
                panels = self.panels;
            if ("index" in cfg) {
                index = cfg.index;
            } else {
                index = cfg.panel;
            }
            // 删除panel后的 trigger 个数
            var afterLen = self._getLength(panels.length - 1),
                triggers = self.triggers,
                trigger = null,
                panel = null;

            if (!panels.length) {
                return;
            }

            // 传入Dom对象时转换成index
            index = S.isNumber(index) ?
                Math.max(0, Math.min(index, panels.length - 1)) :
                S.indexOf(index, panels);

            // 如果trigger跟panel不一一对应则，取最后一个
            trigger = steps == 1 ?
                triggers[index] :
                (afterLen !== beforeLen ? triggers[beforeLen - 1] : null);

            panel = panels[index];


            // 触发删除前事件,可以阻止删除
            if (self.fire(EVENT_BEFORE_REMOVE, {
                index: index,
                panel: panel,
                trigger: trigger
            }) === false) {
                return;
            }

            function deletePanel() {

                // 删除panel
                if (panel) {
                    DOM.remove(panel);
                    panels.splice(index, 1);
                }

                // 删除trigger
                if (trigger) {
                    DOM.remove(trigger);
                    for (var i = 0; i < triggers.length; i++) {
                        if (triggers[i] == trigger) {
                            self.triggers.splice(i, 1);
                            break;
                        }
                    }
                }

                // 重新计算 trigger 的数目
                self._resetLength();

                self.fire(EVENT_REMOVED, {
                    index: index,
                    trigger: trigger,
                    panel: panel
                });
            }

            // 完了
            if (afterLen == 0) {
                deletePanel();
                callback();
                return;
            }

            var activeIndex = self.activeIndex;

            if (steps > 1) {
                if (activeIndex == afterLen) {
                    // 当前屏幕的元素将要空了，先滚到前一个屏幕，然后删除当前屏幕的元素
                    self.switchTo(activeIndex - 1, undefined, undefined, function () {
                        deletePanel();
                        callback();
                    });
                } else {
                    // 不滚屏，其他元素顶上来即可
                    deletePanel();
                    self.activeIndex = -1;
                    // notify datalazyload
                    self.switchTo(activeIndex, undefined, undefined, function () {
                        callback();
                    });
                }
                return;
            }

            // steps ==1
            // 和当前的一样，先滚屏
            if (activeIndex == index) {
                var n = activeIndex > 0 ?
                    activeIndex - 1 :
                    activeIndex + 1;
                self.switchTo(n, undefined, undefined, function () {
                    deletePanel();
                    // 0 是当前项且被删除
                    // 移到 1 删除 0，并设置当前 activeIndex 为 0
                    if (activeIndex == 0) {
                        self.activeIndex = 0;
                    }
                    callback();
                });
            } else {
                // 要删除的在前面，activeIndex -1
                if (activeIndex > index) {
                    activeIndex--;
                    self.activeIndex = activeIndex;
                }
                deletePanel();
                callback();
            }
        },

        /**
         * 切换操作，对外 api
         * @param index 要切换的项
         * @param [direction] 方向，用于 autoplay/circular
         * @param [ev] 引起该操作的事件
         * @param [callback] 运行完回调，和绑定 switch 事件作用一样
         */
        switchTo: function (index, direction, ev, callback) {
            var self = this,
                cfg = self.config,
                fromIndex = self.activeIndex,
                triggers = self.triggers;

            // 再次避免重复触发
            if (!self._triggerIsValid(index)) {
                return self;
            }

            if (self.fire(EVENT_BEFORE_SWITCH, {
                fromIndex: fromIndex,
                toIndex: index
            }) === false) {
                return self;
            }

            self.fromIndex = fromIndex;

            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(triggers[fromIndex] || null, triggers[index]);
            }

            // switch active panels
            if (direction === undefined) {
                direction = index > fromIndex ? FORWARD : BACKWARD;
            }

            // 当前正在处理转移到 index
            self.activeIndex = index;

            // switch view
            self._switchView(direction, ev, function () {
                callback && callback.call(self);
            });

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger: function (fromTrigger, toTrigger) {
            var activeTriggerCls = this.config.activeTriggerCls;

            if (fromTrigger) {
                DOM.removeClass(fromTrigger, activeTriggerCls);
            }

            DOM.addClass(toTrigger, activeTriggerCls);
        },

        _getFromToPanels: function () {
            var self = this,
                fromIndex = self.fromIndex,
                fromPanels,
                toPanels,
                steps = self.config.steps,
                panels = self.panels,
                toIndex = self.activeIndex;

            if (fromIndex > -1) {
                fromPanels = panels.slice(fromIndex * steps, (fromIndex + 1) * steps);
            } else {
                fromPanels = null;
            }

            toPanels = panels.slice(toIndex * steps, (toIndex + 1) * steps);

            return {
                fromPanels: fromPanels,
                toPanels: toPanels
            };
        },

        /**
         * 切换视图
         */
        _switchView: function (direction, ev, callback) {
            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            // 最简单的切换效果：直接隐藏/显示
            if (fromPanels) {
                DOM.css(fromPanels, DISPLAY, NONE);
            }

            DOM.css(toPanels, DISPLAY, BLOCK);

            // fire onSwitch events
            // 同动画时保持一致，强制异步
            setTimeout(function () {
                self._fireOnSwitch(ev);
            }, 0);

            callback && callback.call(this);
        },

        /**
         * 触发 switch 相关事件
         */
        _fireOnSwitch: function (ev) {
            var self = this;
            self.fire(EVENT_SWITCH, S.merge(ev, {
                fromIndex: self.fromIndex,
                currentIndex: this.activeIndex
            }));
        },

        /**
         * 切换到上一视图
         */
        prev: function (ev) {
            var self = this;
            // 循环
            self.switchTo((self.activeIndex - 1 + self.length) % self.length,
                BACKWARD, ev);
        },

        /**
         * 切换到下一视图
         */
        next: function (ev) {
            var self = this;
            // 循环
            self.switchTo((self.activeIndex + 1) % self.length,
                FORWARD, ev);
        },

        destroy: function (keepNode) {
            var self = this,
                pluginHost = self.constructor;

            // destroy plugins by Hierarchy
            while (pluginHost) {
                S.each(pluginHost.Plugins, function (plugin) {
                    if (plugin.destroy) {
                        plugin.destroy(self);
                    }
                });
                pluginHost = pluginHost.superclass ?
                    pluginHost.superclass.constructor :
                    null;
            }

            // 释放DOM,已经绑定的事件
            if (keepNode) {
                Event.remove(self.container);
            } else {
                DOM.remove(self.container);
            }
            self.nav = null;
            self.content = null;
            self.container = null;
            //释放保存元素的集合
            self.triggers = [];
            self.panels = [];
            //释放事件
            self.detach();
        }
    });

    return Switchable;

}, { requires: ['dom', "event"] });

/**
 * yiminghe@gmail.com : 2012.05.22
 *  - 增加 priority 插件初始化优先级
 *
 * yiminghe@gmail.com : 2012.05.03
 *  - 支持 touch 设备，完善 touch 边界情况
 *  - 增加 fromIndex 属性，表示上一个激活的 trigger index
 *  - refactor switchView, 去除多余参数
 *
 * yiminghe@gmail.com : 2012.04.12
 *  - 增加 switch/beforeSwitch 事件对象增加 fromIndex
 *  - 删除状态 completedIndex
 *
 * 董晓庆/yiminghe@gmail.com ：2012.03
 *   - 增加 添加、删除一项的功能 => 工程浩大
 *
 * yiminghe@gmail.com：2011.06.02
 *   - review switchable
 *
 * yiminghe@gmail.com：2011.05.10
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
 *
 * References:
 *  - jQuery Scrollable http://flowplayer.org/tools/scrollable.html
 */
/**
 * @fileOverview aria support for carousel
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/carousel/aria", function (S, DOM, Event, Aria, Carousel, Switchable) {

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
    var setTabIndex = Aria.setTabIndex,
        DOM_EVENT = {originalEvent: {target: 1}},
        FORWARD = 'forward',
        BACKWARD = 'backward';

    function _switch(ev) {
        var self = this,
            steps = self.config.steps,
            index = ev.currentIndex,
            activeIndex = self.activeIndex,
            panels = self.panels,
            panel = panels[index * steps],
            triggers = self.triggers,
            trigger = triggers[index],
            domEvent = ev.originalEvent && !!(ev.originalEvent.target || ev.originalEvent.srcElement);

        // dom 事件触发
        if (domEvent ||
            // 初始化
            activeIndex == -1) {

            S.each(triggers, function (t) {
                setTabIndex(t, -1);
            });

            S.each(panels, function (t) {
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
        var r = null;
        S.each(this.triggers, function (trigger) {
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
        var key = e.keyCode,
            self = this,
            t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findTrigger.call(self, t);
                if (c) {
                    next.call(self, c);
                    e.halt();
                }
                break;

            case KEY_UP:
            case KEY_LEFT:

                c = findTrigger.call(self, t);
                if (c) {
                    prev.call(self, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:
                c = findTrigger.call(self, t);
                if (c) {
                    self.switchTo(S.indexOf(c, self.triggers),
                        undefined, DOM_EVENT);
                    e.halt();
                }
                break;
        }
    }

    function findPanel(t) {
        var r = null;
        S.each(this.panels, function (p) {
            if (p == t || DOM.contains(p, t)) {
                r = p;
                return false;
            }
        });
        return r;
    }


    function nextPanel(c) {
        var self = this,
            n = DOM.next(c),
            panels = self.panels;
        if (!n) {
            n = panels[0];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);

        if (checkPanel.call(self, n, FORWARD)) {
            n.focus();
        }
    }


    function prevPanel(c) {
        var n = DOM.prev(c),
            self = this,
            panels = self.panels;
        if (!n) {
            n = panels[panels.length - 1];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);
        if (checkPanel.call(self, n, BACKWARD)) {
            n.focus();
        }
    }

    function checkPanel(p, direction) {
        var self = this,
            index = S.indexOf(p, self.panels),
            steps = self.config.steps,
            dest = Math.floor(index / steps);
        // 在同一个 panel 组，立即返回
        if (dest == self.activeIndex) {
            return 1;
        }
        if (index % steps == 0 || index % steps == steps - 1) {
            //向前动画滚动中，focus，会不正常 ...
            //传递事件，动画后异步 focus
            self.switchTo(dest, direction, DOM_EVENT);
            return 0;
        }
        return 1;
    }


    function _contentKeydown(e) {

        var self = this,
            key = e.keyCode,
            t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findPanel.call(self, t);
                if (c) {
                    nextPanel.call(self, c);
                    e.halt();
                }
                break;


            case KEY_UP:
            case KEY_LEFT:

                c = findPanel.call(self, t);
                if (c) {
                    prevPanel.call(self, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:

                c = findPanel.call(self, t);
                if (c) {
                    self.fire('itemSelected', { item: c });
                    e.halt();
                }
                break;
        }
    }

    S.mix(Carousel.Config, {
        aria: false
    });

    Switchable.addPlugin({
        name: "aria",
        init: function (self) {
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
            S.each(triggers, function (t) {
                setTabIndex(t, activeIndex == i ? "0" : "-1");
                t.setAttribute("role", "button");
                t.setAttribute("aria-controls", content.id);
                i++;
            });
            i = 0;
            S.each(panels, function (t) {
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
                Event.on(prevBtn, "keydown", function (e) {
                    if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                        self.prev(DOM_EVENT);
                        e.preventDefault();
                    }
                });
            }

            if (nextBtn) {
                setTabIndex(nextBtn, 0);
                nextBtn.setAttribute("role", "button");
                Event.on(nextBtn, "keydown", function (e) {
                    if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                        self.next(DOM_EVENT);
                        e.preventDefault();
                    }
                });
            }

        }
    }, Carousel);

}, {
    requires: ["dom", "event", "../aria", "./base", '../base']
});

/**
 yiminghe@gmail.com：2011.06.02 review switchable

 yiminghe@gmail.com:2011.05.12

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
 **/
/**
 * @fileOverview Carousel Widget
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('switchable/carousel/base', function (S, DOM, Event, Switchable) {

    var CLS_PREFIX = 'ks-switchable-',
        DOT = '.',
        EVENT_ADDED = 'added',
        EVENT_REMOVED = 'removed',
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
        circular:true,
        prevBtnCls:CLS_PREFIX + 'prev-btn',
        nextBtnCls:CLS_PREFIX + 'next-btn',
        disableBtnCls:CLS_PREFIX + 'disable-btn'

    };

    S.extend(Carousel, Switchable, {
        /**
         * 插入 carousel 的初始化逻辑
         *
         * Carousel 的初始化逻辑
         * 增加了:
         *   self.prevBtn
         *   self.nextBtn
         */
        _init:function () {
            var self = this;
            Carousel.superclass._init.call(self);
            var cfg = self.config,
                disableCls = cfg.disableBtnCls;

            // 获取 prev/next 按钮，并添加事件
            S.each(['prev', 'next'], function (d) {
                var btn = self[d + 'Btn'] = DOM.get(DOT + cfg[d + 'BtnCls'],
                    self.container);

                Event.on(btn, 'mousedown', function (ev) {
                    ev.preventDefault();

                    var activeIndex = self.activeIndex;

                    if (d == "prev" && (activeIndex != 0 || cfg.circular)) {
                        self[d](DOM_EVENT);
                    }
                    if (d == "next" && (activeIndex != self.length - 1 || cfg.circular)) {
                        self[d](DOM_EVENT);
                    }
                });
            });

            function updateBtnStatus(current) {
                DOM.removeClass([self[PREV_BTN], self[NEXT_BTN]], disableCls);

                if (current == 0) {
                    DOM.addClass(self[PREV_BTN], disableCls);
                }

                if (current == self.length - 1) {
                    DOM.addClass(self[NEXT_BTN], disableCls);
                }
            }


            // 注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
            // circular = true 时，无需处理
            if (!cfg.circular) {
                // 先动画再 remove
                // switch 事件先于 removed
                self.on(EVENT_ADDED + " " + EVENT_REMOVED, function () {
                    updateBtnStatus(self.activeIndex);
                });

                self.on('switch', function (ev) {
                    updateBtnStatus(ev.currentIndex);
                });
            }
            // 触发 itemSelected 事件
            Event.delegate(self.content, 'click', DOT + self._panelInternalCls, function (e) {
                var item = e.currentTarget;
                self.fire('itemSelected', { item:item });
            });
        }
    });


    return Carousel;

}, { requires:["dom", "event", "../base"]});


/**
 * NOTES:
 *
 * yiminghe@gmail.com：2012.03.08
 *  - 修复快速点击上页/下页，动画没完时 disabled class 没设导致的翻页超出
 *
 * yiminghe@gmail.com：2011.06.02 review switchable
 *
 * yiminghe@gmail.com：2011.05
 *  - 内部组件 init 覆盖父类而不是监听事件
 *
 * 2010.07
 *  - 添加对 prevBtn/nextBtn 的支持
 *  - 添加 itemSelected 事件
 * 2012-3-7 董晓庆
 *  - itemSelected 事件 改为委托
 * TODO:
 *  - itemSelected 时，自动居中的特性
 */
/**
 * @fileOverview Switchable Circular Plugin
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('switchable/circular', function (S, DOM, Anim, Switchable) {

    var clearPosition = {
        position: '',
        left: '',
        top: ''
    };

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    // 限制条件：总 item 数必须至少等于 一屏数
    // 当前帧 fromIndex 总位于总左边，所以 forward 情况下一定不是补帧
    function seamlessCircularScroll(callback, direction) {
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
            correction,
            _realStep = self._realStep,
            totalXX = viewDiff * len;

        props[prop] = -viewDiff * index;

        if (fromIndex == -1) {
            // 初始化
            DOM.css(self.content, props);
            callback && callback();
            return;
        }

        // 最终补帧状态对了
        // realStep 补帧
        // 等于时不要补帧，所以限制条件为：总个数至少等于一屏个数
        if (index + _realStep > len) {
            v = { position: 'relative'};
            v[prop] = totalXX;

            // 补帧数
            correction = index + _realStep - len;

            // 关键要同步！ realStep 取消或设定相对定位的同时要设置 left，保持在用户的显示位置不变
            // 最小补帧
            DOM.css(panels.slice(0, correction), v);
            // 取消其他补帧
            DOM.css(panels.slice(correction, _realStep), clearPosition);
        } else {
            DOM.css(panels.slice(0, _realStep), clearPosition);
        }


        // 调整当前位置
        var fromIndexPosition = DOM.css(panels[fromIndex], "position");

        var dl = (fromIndex + len - index) % len;
        var dr = (index - fromIndex + len) % len;


        // 当前位于补帧，左转比较容易，移到补帧处
        // ??
        // 什么情况下位于补帧并且需要右转?? 除非不满足限制条件
        // dl >= dr && fromIndexPosition == 'relative'

        if (dl < dr && fromIndexPosition == 'relative') {
            DOM.css(self.content, prop,
                -(viewDiff * (len + fromIndex)));
        } else
        // dl > dr
        // || fromIndexPosition != 'relative' 可忽略
        {
            // 当前即使位于补帧，但是之前不是，右转更方便
            // 不移动到补帧新位置
            // 保持原有位置

            //  edge case
            if (fromIndex == len - 1 && index == 0) {
                // 从 viewDiff 到 0，而不是 -(viewDiff * (fromIndex) 到 0，距离最短
                DOM.css(self.content, prop, viewDiff);
            } else {
                // 正常水平 :  -(viewDiff * (fromIndex) ->  -(viewDiff * (index)
                DOM.css(self.content, prop, -(viewDiff * (fromIndex)));
            }
        }

        if (self.anim) {
            self.anim.stop();
        }

        self.anim = new Anim(self.content,
            props,
            cfg.duration,
            cfg.easing,
            function () {
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

        name: 'circular',

        priority: 5,

        /**
         * 根据 effect, 调整初始状态
         */
        init: function (host) {
            var cfg = host.config,
                effect = cfg.effect;

            // 仅有滚动效果需要下面的调整
            if (cfg.circular && (effect === 'scrollx' || effect === 'scrolly')) {
                // 覆盖滚动效果函数
                cfg.scrollType = effect; // 保存到 scrollType 中

                /*
                 特殊处理：容器宽度比单个 item 宽，但是要求 item 一个个循环滚动，关键在于动画中补全帧的处理
                 */
                if(host._realStep){
                    cfg.effect = seamlessCircularScroll;
                } else {
                    cfg.effect = circularScroll;
                }
            }
        }
    });

}, { requires: ["dom", "anim", "./base", "./effect"]});

/**
 * 2012-07-20 yiminghe@gmail.com
 *  - 增强 steps=1 时并且容器可视区域包括多个 item 的单步循环
 *  - 多补帧技术
 *
 *
 * 2012-04-12 yiminghe@gmail.com
 *  - 修复速度过快时从 0 到最后或从最后到 0 时的 bug ： 'relative' 位置没有 reset
 *
 * 2012-06-02 yiminghe@gmail.com
 *  - review switchable
 *
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 'backward' 滚动？需要更灵活
 */
/**
 * @fileOverview Switchable Effect Plugin
 */
KISSY.add('switchable/effect', function (S, DOM, Event, Anim, Switchable, undefined) {

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
//        EVENT_ADDED = 'added',
//        EVENT_REMOVED = 'removed';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: 'easeNone' // easing method
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function (callback) {
            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            if (fromPanels) {
                DOM.css(fromPanels, DISPLAY, NONE);
            }
            DOM.css(toPanels, DISPLAY, BLOCK);
            callback && callback();
        },

        // 淡隐淡现效果
        fade: function (callback) {

            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            if (fromPanels && fromPanels.length !== 1) {
                S.error('fade effect only supports steps == 1.');
            }

            var cfg = self.config,
                fromEl = fromPanels ? fromPanels[0] : null,
                toEl = toPanels[0];

            if (self.anim) {
                // 不执行回调
                self.anim.stop();
                // 防止上个未完，放在最下层
                DOM.css(self.anim.fromEl, {
                    zIndex: 1,
                    opacity: 0
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
                    function () {
                        self.anim = undefined; // free
                        // 切换 z-index
                        DOM.css(toEl, Z_INDEX, 9);
                        DOM.css(fromEl, Z_INDEX, 1);
                        callback && callback();
                    }).run();
                self.anim.toEl = toEl;
                self.anim.fromEl = fromEl;
            } else {
                //初始情况下没有必要动画切换
                DOM.css(toEl, Z_INDEX, 9);
                callback && callback();
            }
        },

        // 水平/垂直滚动效果
        scroll: function (callback, direction, forceAnimation) {
            var self = this,
                fromIndex = self.fromIndex,
                cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * self.activeIndex,
                props = { };

            props[isX ? LEFT : TOP] = -diff + PX;

            if (self.anim) {
                self.anim.stop();
            }
            // 强制动画或者不是初始化
            if (forceAnimation ||
                fromIndex > -1) {
                self.anim = new Anim(self.content, props,
                    cfg.duration,
                    cfg.easing,
                    function () {
                        self.anim = undefined; // free
                        callback && callback();
                    }).run();
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
    Switchable.addPlugin({

        priority: 10,

        name: 'effect',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function (host) {
            var cfg = host.config,
                effect = cfg.effect,
                panels = host.panels,
                content = host.content,
                steps = cfg.steps,
                panels0 = panels[0],
                container = host.container,
                activeIndex = host.activeIndex;

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
                            DOM.width(content, "999999px");
                        }

                        // 只有 scrollX, scrollY 需要设置 viewSize
                        // 其他情况下不需要
                        // 1. 获取高宽
                        host.viewSize = [
                            cfg.viewSize[0] || panels0 && DOM.outerWidth(panels0, true) * steps,
                            cfg.viewSize[1] || panels0 && DOM.outerHeight(panels0, true) * steps
                        ];

                        if (!host.viewSize[0]) {
                            S.error('switchable must specify viewSize if there is no panels');
                        }

                        if (steps == 1 && panels0) {
                            var realStep = 1;
                            var viewSize = host.viewSize;
                            var scroller = panels0.parentNode.parentNode;

                            var containerViewSize = [
                                Math.min(DOM.width(container), DOM.width(scroller)),
                                Math.min(DOM.height(container), DOM.height(scroller))
                            ];

                            if (effect == 'scrollx') {
                                realStep = Math.floor(containerViewSize[0] / viewSize[0]);
                            } else if (effect == 'scrolly') {
                                realStep = Math.floor(containerViewSize[1] / viewSize[1]);
                            }

                            if (realStep > cfg.steps) {
                                // !TODO ugly _realStep
                                host._realStep = realStep;
                            }
                        }

                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        var min = activeIndex * steps,
                            max = min + steps - 1,
                            isActivePanel;

                        S.each(panels, function (panel, i) {
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

        _switchView: function (direction, ev, callback) {

            var self = this,
                cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, function () {
                self._fireOnSwitch(ev);
                callback && callback.call(self);
            }, direction);
        }

    });

    return Switchable;

}, { requires: ["dom", "event", "anim", "./base"]});
/**
 * yiminghe@gmail.com：2011.06.02 review switchable
 */
/**
 * @fileOverview Switchable Lazyload Plugin
 */
KISSY.add('switchable/lazyload', function (S, DOM, Switchable) {

    var EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img',
        AREA_DATA = 'textarea',
        FLAGS = {};

    FLAGS[IMG_SRC] = 'lazyImgAttribute';
    FLAGS[AREA_DATA] = 'lazyTextareaClass';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        lazyImgAttribute: "data-ks-lazyload-custom",
        lazyTextareaClass: "ks-datalazyload-custom",
        lazyDataType: AREA_DATA // or IMG_SRC
    });

    /**
     * 织入初始化函数
     */
    Switchable.addPlugin({

        name: 'lazyload',

        init: function (host) {
            var DataLazyload = S.require("datalazyload"),
                cfg = host.config,
                type = cfg.lazyDataType,
                flag;

            if (type === 'img-src') {
                type = IMG_SRC;
            }
            else if (type === 'area-data') {
                type = AREA_DATA;
            }

            cfg.lazyDataType = type;
            flag = cfg[FLAGS[type]];
            // 没有延迟项
            if (!DataLazyload || !type || !flag) {
                return;
            }

            host.on(EVENT_BEFORE_SWITCH, loadLazyData);

            // 初始 lazyload activeIndex
            loadLazyData({
                toIndex: host.activeIndex
            });

            /**
             * 加载延迟数据
             */
            function loadLazyData(ev) {
                // consider steps == 1
                var steps = host._realStep || cfg.steps,
                    from = ev.toIndex * steps ,
                    to = from + steps;
                DataLazyload.loadCustomLazyData(host.panels.slice(from, to),
                    type, flag);
                if (isAllDone()) {
                    host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }

            /**
             * 是否都已加载完成
             */
            function isAllDone() {
                var elems,
                    i,
                    el,
                    len,
                    isImgSrc = type === IMG_SRC,
                    tagName = isImgSrc ? 'img' : (type === AREA_DATA ?
                        'textarea' : '');

                if (tagName) {
                    elems = DOM.query(tagName, host.container);
                    for (i = 0, len = elems.length; i < len; i++) {
                        el = elems[i];
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

}, { requires: ["dom", "./base"]});
/**
 * 2012-10-17 yiminghe@gmail.com
 *  - 初始 lazyload activeIndex
 *  - consider steps == 1 for carousel
 *
 * yiminghe@gmail.com：2011.06.02 review switchable
 */
/**
 * @fileOverview Tabs Widget
 * @author lifesinger@gmail.com
 */
KISSY.add('switchable/slide/base', function (S, Switchable) {


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

    Slide.Config = {
        autoplay:true,
        circular:true
    };

    S.extend(Slide, Switchable);

    return Slide;

}, { requires:["../base"]});

/**
 * yiminghe@gmail.com：2011.06.02 review switchable
 */
/**
 * @fileOverview switchable
 */
KISSY.add("switchable", function (S, Switchable, Accordion, Carousel, Slide, Tabs) {
    var re = {
        Accordion: Accordion,
        Carousel: Carousel,
        Slide: Slide,
        Tabs: Tabs
    };
    S.mix(Switchable, re);

    S.Switchable = Switchable;

    return Switchable;
}, {
    requires: [
        "switchable/base",
        "switchable/accordion/base",
        "switchable/carousel/base",
        "switchable/slide/base",
        "switchable/tabs/base",
        "switchable/lazyload",
        "switchable/effect",
        "switchable/circular",
        "switchable/carousel/aria",
        "switchable/autoplay",
        "switchable/aria",
        "switchable/tabs/aria",
        "switchable/accordion/aria",
        "switchable/touch"
    ]
});
/**
 * @fileOverview Tabs aria support
 * @author yiminghe@gmail.com
 */
KISSY.add('switchable/tabs/aria', function (S, DOM, Event, Switchable, Aria, Tabs) {

    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    //var KEY_END = 35;
    //var KEY_HOME = 36;
    var EVENT_ADDED = 'added';
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
        aria: true
    });

    Switchable.addPlugin({
        name: "aria",
        init: function (self) {
            if (!self.config.aria) return;
            var triggers = self.triggers,
                activeIndex = self.activeIndex,
                panels = self.panels;
            var container = self.container;
            if (self.nav) {
                DOM.attr(self.nav, "role", "tablist");
            }
            var i = 0;

            function initTrigger(trigger) {
                trigger.setAttribute("role", "tab");
                setTabIndex(trigger, "-1");
                if (!trigger.id) {
                    trigger.id = S.guid("ks-switchable");
                }
            }


            function initPanel(panel, trigger) {
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-hidden", "true");
                panel.setAttribute("aria-labelledby", trigger.id);
            }

            S.each(triggers, initTrigger);


            self.on(EVENT_ADDED, function (e) {
                var t;
                initTrigger(t = e.trigger);
                initPanel(e.panel, t);
            });

            i = 0;

            S.each(panels, function (panel) {
                var t = triggers[i];
                initPanel(panel, t);
                i++;
            });

            if (activeIndex > -1) {
                setTabIndex(triggers[activeIndex], "0");
                panels[activeIndex].setAttribute("aria-hidden", "false");
            }


            self.on("switch", _tabSwitch, self);


            Event.on(container, "keydown", _tabKeydown, self);
            /**
             * prevent firefox native tab switch
             */
            Event.on(container, "keypress", _tabKeypress, self);

        }
    }, Tabs);

    var setTabIndex = Aria.setTabIndex;


    function _currentTabFromEvent(t) {
        var triggers = this.triggers,
            trigger = null;
        S.each(triggers, function (ct) {
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

    var getDomEvent = Switchable.getDomEvent;

    /**
     * Keyboard commands for the Tab Panel
     * @param e
     */
    function _tabKeydown(e) {
        var t = e.target, self = this;
        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        // var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
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

//            case KEY_HOME:
//                if (no_modifier_pressed_flag) {
//                    self.switchTo(0, undefined, getDomEvent(e));
//                    e.halt();
//                }
//                break;
//            case KEY_END:
//                if (no_modifier_pressed_flag) {
//                    self.switchTo(triggers.length - 1, undefined, getDomEvent(e));
//                    e.halt();
//                }
//
//                break;

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
        var domEvent = ev.originalEvent && !!(ev.originalEvent.target || ev.originalEvent.srcElement);

        var self = this;
        // 上一个激活 tab
        var lastActiveIndex = ev.fromIndex;

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


}, {
    requires: ["dom", "event", "../base", "../aria", "./base"]
});

/**
 * 2011-05-08 yiminghe@gmail.com：add support for aria & keydown
 * <h2>键盘快捷键</h2>

 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签 -- 去除
 输入框内 home 跳到输入框第一个字符前面 ，
 end 跳到输入框最后一个字符后面 ，
 不应该拦截
 <li>End: 当焦点在标签时转到最后一个标签 -- 去除
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 */
/**
 * @fileOverview Tabs Widget
 * @author lifesinger@gmail.com
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

    return Tabs;
}, {
    requires:["../base"]
});
/**
 * @fileOverview Touch support for switchable
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/touch", function (S, DOM, Event, Switchable, DD) {

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        mouseAsTouch: false
    });

    Switchable.addPlugin({

        name: 'touch',

        init: function (self) {

            // TODO 单步不支持 touch
            if (self._realStep) {
                return;
            }

            var cfg = self.config,
            // circular 会修改 cfg.effect
                effect = cfg.scrollType || cfg.effect;


            if (effect == 'scrolly' ||
                effect == 'scrollx') {

                var content = self.content,
                    container = self.container,
                    startX,
                    startY,
                    startContentOffset = {},
                    containerRegion = {},
                    prop = "left",
                    diff,
                    viewSize;

                if (effect == 'scrolly') {
                    prop = "top";
                }

                function start() {
                    // interesting!
                    // in touch device:
                    // absolute content can not be touched (edge panel can not be touched)
                    // if its panel relative positioned to edge

                    if (// edge adjusting, wait
                    // 暂时不像 circular 那样处理
                    // resetPosition 瞬移会导致 startContentOffset 变化，复杂了
                        self.panels[self.activeIndex].style.position == 'relative') {
                        // S.log("edge adjusting, wait !");
                        contentDD.stopDrag();
                        return;
                    }

                    // 停止自动播放
                    if (self.stop) {
                        self.stop();
                    }

                    startContentOffset = DOM.offset(content);
                    containerRegion = getRegionFn(container);
                }

                function inRegionFn(n, l, r) {
                    return n >= l && n <= r;
                }

                function getRegionFn(n) {
                    var containerRegion = DOM.offset(n);
                    containerRegion.bottom = containerRegion.top +
                        container.offsetHeight;
                    containerRegion.right = containerRegion.left +
                        container.offsetWidth;
                    return containerRegion;
                }

                function move(e) {

                    var currentOffset = {},
                        inRegion;

                    if (effect == 'scrolly') {
                        viewSize = self.viewSize[1];
                        diff = e.pageY - startY;
                        currentOffset.top = startContentOffset.top + diff;
                        inRegion = inRegionFn(e.pageY,
                            containerRegion.top,
                            containerRegion.bottom);
                    } else {
                        viewSize = self.viewSize[0];
                        diff = e.pageX - startX;
                        currentOffset.left = startContentOffset.left + diff;
                        inRegion = inRegionFn(e.pageX,
                            containerRegion.left,
                            containerRegion.right);
                    }

                    // 已经开始或者第一次拖动距离超过 5px

                    // 正在进行的动画停止
                    if (self.anim) {
                        self.anim.stop();
                        self.anim = undefined;
                    }
                    if (!inRegion) {
                        // 不在容器内，停止拖放
                        contentDD.stopDrag();
                    } else {
                        if (cfg.circular) {
                            var activeIndex = self.activeIndex,
                                threshold = self.length - 1;
                            /*
                             circular logic :
                             only run once after mousedown/touchstart
                             */
                            if (activeIndex == threshold) {
                                Switchable.adjustPosition
                                    .call(self, self.panels, 0, prop, viewSize);
                            } else if (activeIndex == 0) {
                                Switchable.adjustPosition
                                    .call(self, self.panels,
                                    threshold, prop, viewSize);
                            }
                        }

                        // 跟随手指移动
                        DOM.offset(content, currentOffset);
                    }

                }

                function end() {

                    /*
                     circular logic
                     */
                    var activeIndex = self.activeIndex,
                        lastIndex = self.length - 1;

                    if (!cfg.circular) {
                        // 不能循环且到了边界，恢复到原有位置
                        if (diff < 0 && activeIndex == lastIndex ||
                            diff > 0 && activeIndex == 0) {
                            // 强制动画恢复到初始位置
                            Switchable.Effects[effect].call(self,
                                undefined, undefined, true);
                            return;
                        }
                    }

                    if (diff < 0 && activeIndex == lastIndex) {
                        // 最后一个到第一个
                    } else if (diff > 0 && activeIndex == 0) {
                        // 第一个到最后一个
                    } else if (activeIndex == 0 || activeIndex == lastIndex) {
                        // 否则的话恢复位置
                        Switchable.resetPosition.call(self,
                            self.panels,
                            activeIndex == 0 ? lastIndex : 0,
                            prop,
                            viewSize);
                    }

                    self[diff < 0 ? 'next' : 'prev']();

                    // 开始自动播放
                    if (self.start) {
                        self.start();
                    }
                }


                if (cfg.mouseAsTouch) {
                    DD = S.require('dd/base');
                }
                if (DD) {
                    var contentDD = new DD.Draggable({
                        node: content
                    });
                    contentDD.on("dragstart", function () {
                        start();
                        startX = contentDD.get('startMousePos').left;
                        startY = contentDD.get('startMousePos').top;
                    });
                    contentDD.on("drag", move);
                    contentDD.on("dragend", end);
                    self.__touchDD = contentDD;
                }

            }
        },

        destroy: function (self) {
            var d;
            if (d = self.__touchDD) {
                d.destroy();
            }
        }
    });
}, {
    requires: [
        'dom', 'event', './base',
        KISSY.Features.isTouchSupported() ? 'dd/base' : ''
    ]
});

/**
 * !TODO consider when circular is set false!
 *
 * known issues:
 * When too fast empty content occurs between first changed to last one
 * or last changed to first
 **/
