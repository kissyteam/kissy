/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-22 23:10:54
Revision: 333
*/
/**
 * Triggerable
 * @module      triggerable
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event, event-mouseenter
 */
KISSY.add("triggerable", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        BEFORE_SWITCH = "beforeSwitch",
        ON_SWITCH = "onSwitch";

    /**
     * Triggerable
     * @constructor
     * 约定：
     *   - this.config.triggerType   触发类型。默认为 mouse
     *   - this.config.triggerDelay  触发延迟。默认为 0.1s
     *   - this.triggers
     *   - this.panels
     *   - this.activeIndex
     */
    function Triggerable() {
    }

    S.mix(Triggerable.prototype, {

        /**
         * 初始化 triggers
         */
        _initTriggers: function() {
            // create custom events
            this.createEvent(BEFORE_SWITCH);
            this.createEvent(ON_SWITCH);

            // bind triggers events
            this._bindTriggers();
        },

        /**
         * 给 triggers 添加事件

         */
        _bindTriggers: function() {
            var self = this,
                cfg = self.config, triggers = self.triggers,
                i, len = triggers.length, trigger;

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
         * @protected
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if(self.showTimer) self.showTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            if(self.activeIndex === index) return; // 重复点击

            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         * @protected
         */
        _onMouseEnterTrigger: function(index) {
            var self = this;

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            if (self.activeIndex !== index) {
                self.showTimer = Lang.later(self.config.triggerDelay * 1000, self, function() {
                    self.switchTo(index);
                });
            }
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         * @protected
         */
        _onMouseLeaveTrigger: function() {
            var self = this;

            if (self.showTimer) self.showTimer.cancel();
        },

        /**
         * 切换操作
         */
        switchTo: function(index) {
            var self = this, cfg = self.config,
                triggers = self.triggers,
                panels = self.panels,
                fromPanel = panels[self.activeIndex],
                toPanel = panels[index];

            //S.log("Triggerable.switchTo: index = " + index);

            // fire beforeSwitch
            if(!self.fireEvent(BEFORE_SWITCH, index)) return self;
            // TODO: YUI 2.8.0r4 bug - don't pass multi args correctly
            //if(!self.fireEvent(BEFORE_SWITCH, fromPanel, toPanel, index)) return self;

            // 切换 active trigger
            Dom.removeClass(triggers[self.activeIndex], cfg.activeTriggerCls);
            Dom.addClass(triggers[index], cfg.activeTriggerCls);

            // 切换 content
            self._switchContent(fromPanel, toPanel, index);

            // 更新 activeIndex
            self.activeIndex = index;

            // fire onSwitch
            self.fireEvent(ON_SWITCH, index);
            // TODO: see above TODO
            //self.fireEvent(ON_SWITCH, toPanel, index);

            return self; // chain
        },

        /**
         * 切换内容
         * @protected
         */
        _switchContent: function(fromPanel, toPanel/*, index*/) {
            // 最简单的切换效果：直接隐藏/显示
            fromPanel.style.display = "none";
            toPanel.style.display = "";
        }
    });

    S.augment(Triggerable, Y.EventProvider);
    S.Triggerable = Triggerable;
});
