/**
 * @ignore
 * Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/render", function (S, Component, ComboboxTpl) {

    var ComboboxRender = Component.Render.extend({

        initializer: function () {
            var childrenElSelectors = this.get('childrenElSelectors');
            S.mix(childrenElSelectors, {
                input: '#ks-combobox-input-{id}',
                trigger: '#ks-combobox-trigger-{id}',
                invalidEl: '#ks-combobox-invalid-el-{id}',
                placeholderEl: '#ks-combobox-placeholder-{id}'
            });
        },

        getKeyEventTarget: function () {
            return this.get("input");
        },

        _onSetCollapsed: function (v) {
            this.get("input").attr("aria-expanded", !v);
        },

        _onSetDisabled: function (v) {
            ComboboxRender.superclass._onSetDisabled.apply(this, arguments);
            this.get("input").attr("disabled", v);
        }

    }, {
        ATTRS: {

            collapsed: {
                value: true,
                sync: 0
            },

            hasTrigger: {
                value: true,
                sync: 0
            },

            input: {
            },

            value: {
            },

            disabled: {
                sync: 0
            },

            trigger: {
            },

            placeholder: {
            },

            placeholderEl: {
            },

            invalidEl: {
            },

            contentTpl: {
                value: ComboboxTpl
            }
        },
        HTML_PARSER: {
            input: function (el) {
                return el.one("." + this.getBaseCssClass('input'));
            },
            trigger: function (el) {
                return el.one("." + this.getBaseCssClass('trigger'));
            },
            invalidEl: function (el) {
                return el.one("." + this.getBaseCssClass('invalid-el'));
            },
            placeholderEl: function (el) {
                return el.one("." + this.getBaseCssClass('placeholder'));
            }
        }
    });

    return ComboboxRender;
}, {
    requires: ['component/base', './combobox-tpl']
});