/**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>,yiminghe@gmail.com
 */
KISSY.add('switchable/tabs', function(S, Switchable) {

    var Event = S.Event,DOM = S.DOM;
    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_END = 35;
    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;

    var KEY_SPACE = 32;
    var KEY_TAB = 9;

    var KEY_BACKSPACE = 8;
    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
    var KEY_INSERT = 45;
    var KEY_ESCAPE = 27;

    /**
     * Tabs Class
     * @constructor
     */
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
        return 0;
    }

    S.extend(Tabs, Switchable, {
        _init:function() {
            var self = this;
            Tabs.superclass._init.call(this);
            var activeIndex = self.activeIndex;
            self.lastActiveIndex = activeIndex;
            var triggers = self.triggers,panels = self.panels;
            var activeTab = triggers[activeIndex];
            var i = 0;
            S.each(triggers, function(trigger) {
                trigger.setAttribute("role", "tab");
                trigger.tabIndex = i == activeIndex ? "0" : "-1";
                if (!trigger.id) {
                    trigger.id = S.guid("ks-switchable");
                }
                i++;
            });
            i = 0;
            S.each(panels, function(panel) {
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-hidden", i == activeIndex ? "false" : "true");
                panel.setAttribute("aria-labelledby", triggers[i].id);
                i++;
            });

            self.on("switch", self._tabSwitch, self);
            var container = self.container;

            Event.on(container, "keydown", self._tabKeydown, self);
            /**
             * prevent firefox native tab switch
             */
            Event.on(container, "keypress", self._tabKeypress, self);

        },

        _currentTabFromEvent:function(t) {
            var triggers = this.triggers,trigger;
            S.each(triggers, function(ct) {
                if (ct == t || DOM.contains(ct, t)) {
                    trigger = ct;
                }
            });
            return trigger;
        },

        _currentPanelFromEvent:function(t) {
            var panels = this.panels,panel;
            S.each(panels, function(ct) {
                if (ct == t || DOM.contains(ct, t)) {
                    panel = ct;
                }
            });
            return panel;
        },
        _tabKeypress:function(e) {

            switch (e.keyCode) {

                case KEY_PAGEUP:
                case KEY_PAGEDOWN:
                    if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                        e.stopPropagation();
                    } // endif
                    break;

                case KEY_TAB:
                    if (e.ctrlKey && !e.altKey) {
                        e.stopPropagation();
                    } // endif
                    break;

            }
        },

        /**
         * Keyboard commands for the Tab Panel
         * @param e
         */
        _tabKeydown:function(e) {
            var t = e.target,self = this;
            var triggers = self.triggers;

            // Save information about a modifier key being pressed
            // May want to ignore keyboard events that include modifier keys
            var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
            var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

            switch (e.keyCode) {

                case KEY_LEFT:
                case KEY_UP:
                    if (self._currentTabFromEvent(t)
                        && no_modifier_pressed_flag) {
                        self.prev();
                        e.stopPropagation();
                    } // endif
                    break;

                case KEY_RIGHT:
                case KEY_DOWN:
                    if (self._currentTabFromEvent(t)
                        && no_modifier_pressed_flag) {
                        self.next();
                        e.stopPropagation();
                    } // endif
                    break;

                case KEY_PAGEDOWN:

                    if (control_modifier_pressed_flag) {
                        S.log("租借");
                        e.stopPropagation();
                        e.preventDefault();
                        self.next();

                    }
                    break;

                case KEY_PAGEUP:
                    if (control_modifier_pressed_flag) {
                        e.stopPropagation();
                        self.prev();

                    }
                    break;

                case KEY_HOME:
                    if (no_modifier_pressed_flag) {
                        self.switchTo(0);
                        e.stopPropagation();
                    }
                    break;
                case KEY_END:
                    if (no_modifier_pressed_flag) {
                        self.switchTo(triggers.length - 1);
                        e.stopPropagation();
                    }

                    break;
                case KEY_TAB:
                    if (e.ctrlKey && !e.altKey) {
                        e.stopPropagation();
                        if (e.shiftKey)
                            self.prev();
                        else
                            self.next();

                    }
                    break;
            }
        },

        _tabSwitch:function(ev) {
            var self = this;
            var lastActiveIndex = self.lastActiveIndex;
            var activeIndex = ev.currentIndex;

            if (lastActiveIndex === undefined || lastActiveIndex == activeIndex) return;

            var lastTrigger = self.triggers[lastActiveIndex];
            var trigger = self.triggers[activeIndex];
            var lastPanel = self.panels[lastActiveIndex];
            var panel = self.panels[activeIndex];
            lastTrigger.tabIndex = "-1";
            trigger.tabIndex = "0";
            trigger.focus();
            lastPanel.setAttribute("aria-hidden", "true");
            panel.setAttribute("aria-hidden", "false");
            self.lastActiveIndex = activeIndex;
        }
    });
    return Tabs;

},
{
    requires:["switchable/base"]
}
    )
    ;

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
