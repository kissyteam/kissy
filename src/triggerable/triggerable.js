/**
 * Triggerable
 * @module      triggerable
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("triggerable", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;

    /**
     * Triggerable
     * @constructor
     * 约定：
     *   - this.config.triggerType   触发类型。默认为 mouse
     *   - this.config.triggerDelay  触发延迟。默认为 0.1
     *   - this.triggers
     *   - this.panels
     *   - this.activeIndex
     */
    function Triggerable() {
    }

    S.mix(Triggerable.prototype, {

        /**
         * 给 triggers 添加事件

         */
        _bindTriggers: function() {
            var self = this, cfg = self.config, triggers = self.triggers,
                i, len = triggers.length;

            for (i = 0; i < len; i++) {
                
                if (cfg.triggerType === "mouse") {
                    Event.on(triggers[i], "mouseover", self._onMouseOverTrigger, i, self);
                    Event.on(triggers[i], "mouseout", self._onMouseOutTrigger, i, self);
                }
            }
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         * @protected
         */
        _onMouseOverTrigger: function(index) {
            var self = this;

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            if (self.activeIndex !== index) {
                self.showTimer = Lang.later(self.config.triggerDelay, self, "switchTo", index);
            }
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         * @protected
         */
        _onMouseOutTrigger: function() {
            var self = this;
            if (self.showTimer) self.showTimer.cancel();
        },

        /**
         * 切换内容
         */
        switchTo: function(index) {

        }
    });

    S.Triggerable = Triggerable;
});
