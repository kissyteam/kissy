/**
 * Switchable
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
                // 修复ie下不加null的问题
                nextTrigger = triggers[index] || null;
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
