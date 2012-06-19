/**
 * @fileOverview Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/baseRender", function (S, Component) {

    var tpl = '<div class="ks-combobox-input-wrap">' +
            '</div>',
        triggerTpl = '<div class="ks-combobox-trigger">' +
            '<div class="ks-combobox-trigger-inner">&#x25BC;</div>' +
            '</div>',
        inputTpl = '<input ' +
            'aria-haspopup="true" ' +
            'aria-combobox="list" ' +
            'aria-haspopup="true" ' +
            'role="combobox" ' +
            'combobox="off" ' +
            'class="ks-combobox-input" />';

    return Component.Render.extend({

        createDom:function () {
            var self = this,
                wrap,
                input,
                el = self.get("el"),
                trigger = self.get("trigger");

            if (!self.get("srcNode")) {
                el.append(tpl);
                wrap = el.one(".ks-combobox-input-wrap");
                input = self.get("input") || S.all(inputTpl);
                wrap.append(input);
                self.__set("input", input);
            }
            if (!trigger) {
                self.__set("trigger", S.all(triggerTpl));
            }

            self.get("trigger").unselectable();
        },

        setAriaOwns:function (v) {
            this.get("input").attr("aria-owns", v);
        },

        getKeyEventTarget:function () {
            return this.get("input");
        },

        _uiSetCollapsed:function (v) {
            this.get("input").attr("aria-expanded", v);
        },

        _uiSetHasTrigger:function (t) {
            var trigger = this.get("trigger");
            if (t) {
                this.get("el").prepend(trigger);
            } else {
                trigger.remove();
            }
        }
    }, {
        ATTRS:{
            collapsed:{},
            hasTrigger:{
                value:true
            },
            input:{},
            trigger:{}
        },
        HTML_PARSER:{
            input:function (el) {
                return el.one(".ks-combobox-input");
            },
            trigger:function (el) {
                return el.one(".ks-combobox-trigger");
            }
        }
    });
}, {
    requires:['component']
});