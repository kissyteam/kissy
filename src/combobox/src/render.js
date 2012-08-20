/**
 * @fileOverview Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/render", function (S, Component) {

    var $ = S.all,
        tpl = '<div class="ks-combobox-input-wrap">' +
            '</div>',
        triggerTpl = '<div class="ks-combobox-trigger">' +
            '<div class="ks-combobox-trigger-inner">&#x25BC;</div>' +
            '</div>',
        inputTpl = '<input ' +
            'aria-haspopup="true" ' +
            'aria-autocomplete="list" ' +
            'aria-haspopup="true" ' +
            'role="autocomplete" ' +
            'autocomplete="off" ' +
            'class="ks-combobox-input" />';

    var ComboboxRender = Component.Render.extend({

        createDom: function () {
            var self = this,
                wrap,
                input = self.get("input"),
                inputId,
                el = self.get("el"),
                trigger = self.get("trigger");

            if (!self.get("srcNode")) {
                el.append(tpl);
                wrap = el.one(".ks-combobox-input-wrap");
                input = input || S.all(inputTpl);
                wrap.append(input);
                self.__set("input", input);
            }


            if (!trigger) {
                self.__set("trigger", S.all(triggerTpl));
            }

            self.get("trigger").unselectable();

            var invalidMessage;

            if (invalidMessage = self.get("invalidMessage")) {
                var invalidEl = $("<div " +
                    "title='" + invalidMessage + "' " +
                    "class='ks-combobox-invalid-el'>" +
                    "<div class='ks-combobox-invalid-inner'></div>" +
                    "</div>").insertBefore(input.parent());
                self.__set("invalidEl", invalidEl);
            }

            var placeholder;

            if (placeholder = self.get("placeholder")) {
                if (!(inputId = input.attr("id"))) {
                    input.attr("id", inputId = S.guid("ks-combobox-input"));
                }
                self.__set('placeholderEl', $('<label for="' +
                    inputId + '" ' +
                    'class="ks-combobox-placeholder">' +
                    placeholder + '</label>').appendTo(el));
            }
        },

        getKeyEventTarget: function () {
            return this.get("input");
        },

        _uiSetCollapsed: function (v) {
            this.get("input").attr("aria-expanded", v);
        },

        _uiSetHasTrigger: function (t) {
            var trigger = this.get("trigger");
            if (t) {
                this.get("el").prepend(trigger);
            } else {
                trigger.remove();
            }
        },

        _uiSetDisabled: function (v) {
            ComboboxRender.superclass._uiSetDisabled.apply(this, arguments);
            this.get("input").attr("disabled", v);
        }

    }, {
        ATTRS: {
            collapsed: {
                value: true
            },

            hasTrigger: {
                value: true
            },

            input: {
            },

            trigger: {
            },

            placeholder: {
            },

            placeholderEl: {

            },

            invalidMessage: {
            },

            invalidEl: {
            }
        },
        HTML_PARSER: {
            input: function (el) {
                return el.one(".ks-combobox-input");
            },
            trigger: function (el) {
                return el.one(".ks-combobox-trigger");
            }
        }
    });

    return ComboboxRender;
}, {
    requires: ['component']
});