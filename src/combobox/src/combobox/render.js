/**
 * @ignore
 * Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Control = require('component/control');
    var ComboboxTpl = require('./combobox-xtpl');

    return Control.getDefaultRender().extend({

        beforeCreateDom: function (renderData, childrenElSelectors) {
            S.mix(childrenElSelectors, {
                input: '#ks-combobox-input-{id}',
                trigger: '#ks-combobox-trigger-{id}',
                invalidEl: '#ks-combobox-invalid-el-{id}',
                placeholderEl: '#ks-combobox-placeholder-{id}'
            });
        },

        getKeyEventTarget: function () {
            return this.control.get('input');
        },

        _onSetCollapsed: function (v) {
            this.control.get('input').attr('aria-expanded', !v);
        },

        _onSetDisabled: function (v, e) {
            this.callSuper(v, e);
            this.control.get('input').attr('disabled', v);
        }

    }, {
        ATTRS: {
            contentTpl: {
                value: ComboboxTpl
            }
        },
        HTML_PARSER: {
            value: function (el) {
                return el.one('.' + this.getBaseCssClass('input')).val();
            },
            input: function (el) {
                return el.one('.' + this.getBaseCssClass('input'));
            },
            trigger: function (el) {
                return el.one('.' + this.getBaseCssClass('trigger'));
            },
            invalidEl: function (el) {
                return el.one('.' + this.getBaseCssClass('invalid-el'));
            },
            placeholderEl: function (el) {
                return el.one('.' + this.getBaseCssClass('placeholder'));
            }
        }
    });
});