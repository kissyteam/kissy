/**
 * @ignore
 *  Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/render", function (S, Component, undefined) {

    var $ = S.all,
        tpl = '<div class="{prefixCls}combobox-input-wrap">' +
            '</div>',
        triggerTpl = '<div class="{prefixCls}combobox-trigger">' +
            '<div class="{prefixCls}combobox-trigger-inner">&#x25BC;</div>' +
            '</div>',
        inputTpl = '<input ' +
            'aria-haspopup="true" ' +
            'aria-autocomplete="list" ' +
            'aria-haspopup="true" ' +
            'role="autocomplete" ' +
            'autocomplete="off" ' +
            'class="{prefixCls}combobox-input" />';

    var ComboboxRender = Component.Render.extend({

        createDom: function () {
            var self = this,
                wrap,
                input = self.get("input"),
                inputId,
                prefixCls = self.get('prefixCls'),
                el = self.get("el"),
                trigger = self.get("trigger");

            if (!self.get("srcNode")) {
                el.append(S.substitute(tpl, {
                    prefixCls: prefixCls
                }));
                wrap = el.one("." + prefixCls + "combobox-input-wrap");
                input = input || S.all(S.substitute(inputTpl, {
                    prefixCls: prefixCls
                }));
                wrap.append(input);
                self.setInternal("input", input);
            }

            if (!trigger) {
                self.setInternal("trigger", S.all(S.substitute(triggerTpl, {
                    prefixCls: prefixCls
                })));
            }

            self.get("trigger").unselectable(/**
             @type {HTMLElement}
             @ignore
             */undefined);

            var invalidEl = $("<div " +
                "class='" + prefixCls + "combobox-invalid-el'>" +
                "<div class='" + prefixCls + "combobox-invalid-inner'></div>" +
                "</div>").insertBefore(input.parent(/**
                 @type {HTMLElement}
                 @ignore
                 */undefined, undefined), /**
                 @type {HTMLElement}
                 @ignore
                 */undefined);
            self.setInternal("invalidEl", invalidEl);

            var placeholder;

            if (placeholder = self.get("placeholder")) {
                if (!(inputId = input.attr("id"))) {
                    input.attr("id", inputId = S.guid("ks-combobox-input"));
                }
                self.setInternal('placeholderEl', $('<label for="' +
                    inputId + '" ' +
                    'class="' + prefixCls + 'combobox-placeholder">' +
                    placeholder + '</label>').appendTo(el));
            }
        },

        getKeyEventTarget: function () {
            return this.get("input");
        },

        _onSetCollapsed: function (v) {
            this.get("input").attr("aria-expanded", v);
        },

        '_onSetHasTrigger': function (t) {
            var trigger = this.get("trigger");
            if (t) {
                this.get("el").prepend(trigger);
            } else {
                trigger.remove();
            }
        },

        _onSetDisabled: function (v) {
            ComboboxRender.superclass._onSetDisabled.apply(this, arguments);
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

            invalidEl: {
            }
        },
        HTML_PARSER: {
            input: function (el) {
                return el.one("." + this.get('prefixCls') + "combobox-input");
            },
            trigger: function (el) {
                return el.one("." + this.get('prefixCls') + "combobox-trigger");
            }
        }
    });

    return ComboboxRender;
}, {
    requires: ['component/base']
});