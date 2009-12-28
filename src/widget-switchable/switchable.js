/**
 * Switchable
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget
 */
KISSY.add("switchable", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        UNDEFINED = "undefined",
        SWITCHABLE = "switchable",
        BEFORE_SWITCH = "beforeSwitch", ON_SWITCH = "onSwitch",
        CLS_PREFIX = "ks-switchable-",
        Switchable = { };

        Switchable.Config = {
            mackupType: 0, // mackup 的类型，取值如下：

            // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
            navCls: CLS_PREFIX + "nav",
            contentCls: CLS_PREFIX + "content",

            // 1 - 适度灵活：通过 cls 来获取 triggers 和 panels
            triggerCls: CLS_PREFIX + "trigger",
            panelCls: CLS_PREFIX + "panel",

            // 2 - 完全自由：直接传入 triggers 和 panels
            triggers: [],
            panels: [],

            // 触发类型
            triggerType: "mouse", // or "click"
            // 触发延迟
            delay: .1, // 100ms

            activeIndex: 0, // mackup 的默认激活项，应该与此 index 一致
            activeTriggerCls: "active"
        };

    /**
     * Attaches switchable ablility to Widget.
     * required members：
     *   - this.container
     *   - this.config
     * attached members:
     *   - this.triggers  值为 [] 时，代表无触点
     *   - this.panels    肯定有值，且 length > 1
     *   - this.activeIndex
     *   - this.switchTimer
     */
    S.Widget.prototype.switchable = function(config) {
        var self = this; config = config || {};

        // 根据配置信息，自动调整默认配置
        if (config.panelCls) {
            Switchable.Config.mackupType = 1;
        } else if (config.panels) {
            Switchable.Config.mackupType = 2;
        }

        /**
         * 配置参数
         * @type object
         */
        self.config[SWITCHABLE] = S.merge(Switchable.Config, config || {});

        /**
         * triggers
         * @type Array of HTMLElement
         */
        self.triggers = self.triggers || [];

        /**
         * panels
         * @type Array of HTMLElement
         */
        self.panels = self.panels || [];

        /**
         * the parentNode of panels
         * @type HTMLElement
         */
        //self.content

        /**
         * 当前激活的 index
         * @type number
         */
        if (typeof self.activeIndex === UNDEFINED) {
            self.activeIndex = self.config[SWITCHABLE].activeIndex;
        }

        // attach and init
        S.mix(self, Switchable);
        self._initSwitchable();

        return self; // chain
    };

    S.mix(Switchable, {

        /**
         * init switchable
         */
        _initSwitchable: function() {
            var self = this;

            // parse mackup
            if(!self.panels.length) {
                self._parseSwitchableMackup();
            }

            // create custom events
            self.createEvent(BEFORE_SWITCH);
            self.createEvent(ON_SWITCH);

            // bind triggers
            if(self.triggers.length) {
                self._bindTriggers();
            }
        },

        /**
         * 解析 mackup 的 switchable 部分，获取 triggers, panels, content
         */
        _parseSwitchableMackup: function() {
            var self = this, container = self.container, cfg = self.config[SWITCHABLE],
                nav, content, triggers = [], panels = [], i, len,
                getElementsByClassName = Dom.getElementsByClassName;

            switch (cfg.mackupType) {
                case 0: // 默认结构
                    nav = getElementsByClassName(cfg.navCls, "*", container)[0];
                    content = getElementsByClassName(cfg.contentCls, "*", container)[0];
                    if(nav) triggers = Dom.getChildren(nav);
                    panels = Dom.getChildren(content);
                    break;
                case 1: // 适度灵活
                    triggers = getElementsByClassName(cfg.triggerCls, "*", container);
                    panels = getElementsByClassName(cfg.panelCls, "*", container);
                    break;
                case 2: // 完全自由
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }

            // 自动生成 triggers
            len = panels.length;
            if(len > 0 && !triggers.length) {
                triggers = self._generateTriggersMackup(len);
            }

            // 将 triggers 和 panels 转换为普通数组
            for (i = 0; i < len; i++) {
                self.triggers.push(triggers[i]);
                self.panels.push(panels[i]);
            }

            // get content
            self.content = content || panels[0].parentNode;
        },

        /**
         * 自动生成 triggers 的 mackup
         * @protected
         */
        _generateTriggersMackup: function(len) {
            var self = this, cfg = self.config[SWITCHABLE],
                ul = document.createElement("UL"), li, i;

            ul.className = cfg.navCls;
            for (i = 0; i < len; i++) {
                li = document.createElement("LI");
                if (i === self.activeIndex) {
                    li.className = cfg.activeTriggerCls;
                }
                li.innerHTML = i + 1;
                ul.appendChild(li);
            }

            self.container.appendChild(ul);
            return Dom.getChildren(ul);
        },

        /**
         * 给 triggers 添加事件
         */
        _bindTriggers: function() {
            var self = this, cfg = self.config[SWITCHABLE],
                triggers = self.triggers, trigger,
                i, len = triggers.length;

            for (i = 0; i < len; i++) {
                (function(index) {
                    trigger = triggers[index];

                    // 响应点击和 Tab 键
                    Event.on(trigger, "click", function() {
                        self._onFocusTrigger(index);
                    });
                    Event.on(trigger, "focus", function() {
                        self._onFocusTrigger(index);
                    });

                    // 响应鼠标悬浮
                    if (cfg.triggerType === "mouse") {
                        Event.on(trigger, "mouseenter", function() {
                            self._onMouseEnterTrigger(index);
                        });
                        Event.on(trigger, "mouseleave", function() {
                            self._onMouseLeaveTrigger(index);
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
            if (self.activeIndex === index) return; // 重复点击
            if (self.switchTimer) self.switchTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index) {
            var self = this;
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            if (self.activeIndex !== index) {
                self.switchTimer = Lang.later(self.config[SWITCHABLE].delay * 1000, self, function() {
                    self.switchTo(index);
                });
            }
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.switchTimer) self.switchTimer.cancel();
        },

        /**
         * 切换操作
         */
        switchTo: function(index) {
            var self = this, cfg = self.config[SWITCHABLE],
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex;
            //S.log("Triggerable.switchTo: index = " + index);

            // fire event
            if (!self.fireEvent(BEFORE_SWITCH, index)) return self;

            // switch active trigger
            if(!cfg.noTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers[activeIndex] : null, triggers[index]);
            }

            // switch active panel
            self._switchPanel(panels[activeIndex], panels[index], index);

            // update activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger: function(fromEl, toEl/*, index*/) {
            var activeTriggerCls = this.config[SWITCHABLE].activeTriggerCls;

            if (fromEl) Dom.removeClass(fromEl, activeTriggerCls);
            Dom.addClass(toEl, activeTriggerCls);
        },

        /**
         * 切换当前面板
         */
        _switchPanel: function(fromEl, toEl, index) {
            // 最简单的切换效果：直接隐藏/显示
            fromEl.style.display = "none";
            toEl.style.display = "block";

            // fire onSwitch
            this.fireEvent(ON_SWITCH, index);
        }
    });

    S.mix(Switchable, Y.EventProvider.prototype);
    S.Switchable = Switchable;
});
