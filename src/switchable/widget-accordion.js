/**
 * Accordion Widget
 * @creator  沉鱼<fool2fish@gmail.com>
 */
KISSY.add('accordion', function(S) {

    var DOM = S.DOM,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        FORWARD = 'forward',
        EVENT_BEFORE_SWITCH = 'beforeSwitch', EVENT_SWITCH = 'switch',

        defaultConfig = {
            triggerType: 'click',
            multiple: false
        };

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

        Accordion.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    S.extend(Accordion, S.Switchable);
    S.Accordion = Accordion;

    S.augment(Accordion, {

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index) {
            var self = this , cfg = self.config;
            if (self.activeIndex === index && (!cfg.multiPanelExpandable)) return; // 重复点击
            if (self.switchTimer) self.switchTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index) {
            var self = this, cfg = self.config;
            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            if (cfg.multiPanelExpandable || self.activeIndex !== index) {
                self.switchTimer = S.later(function() {
                    self.switchTo(index);
                }, self.config.delay * 1000);
            }
        },

        switchTo: function(index, direction) {
            var self = this, cfg = self.config,
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex;

            // if mutilple panels allow to be expanded
            if (cfg.multiPanelExpandable) {
                if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) return self;

                // switch active panels
                if (direction === undefined) {
                    direction = index > activeIndex ? FORWARD : FORWARD;
                }

                var activeTriggerCls = cfg.activeTriggerCls;
                if (panels[index].style.display == NONE) {
                    DOM.addClass(triggers[index], activeTriggerCls);
                    DOM.css(panels[index], DISPLAY, BLOCK);
                } else {
                    DOM.removeClass(triggers[index], activeTriggerCls);
                    DOM.css(panels[index], DISPLAY, NONE);
                }

                // fire onSwitch
                this.fire(EVENT_SWITCH);

                // update activeIndex
                self.activeIndex = index;

                // if only one panel allow to be expanded
            } else {
                Accordion.superclass.switchTo.call(self, index, direction);
            }
            return self; // chain
        }
    });
});
