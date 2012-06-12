/**
 * @fileOverview Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/baseRender", function (S, Component) {

    var tpl = '<div class="ks-combobox-trigger">' +
            '<div class="ks-combobox-trigger-inner">&#x25BC;</div>' +
            '</div>' +
            '<div class="ks-combobox-input-wrap">' +
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
            var self = this, el = self.get("el");
            if (!self.get("srcNode")) {
                el.append(tpl);
                var wrap = el.one(".ks-combobox-input-wrap");
                var input = self.get("input") || S.all(inputTpl);
                wrap.append(input);
                self.__set("input", input);
                self.__set("trigger", el.one(".ks-combobox-trigger"));
            }
            self.get("trigger").unselectable();
        },

        _uiSetAriaOwns:function (v) {
            this.get("input").attr("aria-owns", v);
        },

        getKeyEventTarget:function () {
            return this.get("input");
        },

        _uiSetCollapsed:function (v) {
            this.get("input").attr("aria-expanded", v);
        },

        _uiSetHasTrigger:function (t) {
            this.get("trigger")[t ? 'show' : 'hide']();
        }
    }, {
        ATTRS:{
            ariaOwns:{},
            collapsed:{},
            hasTrigger:{},
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