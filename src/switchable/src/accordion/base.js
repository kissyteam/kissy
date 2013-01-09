/**
 *  Accordion Widget
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
