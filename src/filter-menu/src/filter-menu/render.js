/**
 * @ignore
 * filter menu render
 * 1.create filter input
 * 2.change menu content element
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Menu = require('menu');
    var FilterMenuTpl = require('./render-xtpl');
    var ContentRenderExtension = require('component/extension/content-render');

    return Menu.getDefaultRender().extend([ContentRenderExtension], {

        beforeCreateDom: function (renderData, childrenElSelectors) {
            S.mix(childrenElSelectors, {
                placeholderEl: '#ks-filter-menu-placeholder-{id}',
                filterInputWrap: '#ks-filter-menu-input-wrap-{id}',
                filterInput: '#ks-filter-menu-input-{id}'
            });
        },

        getKeyEventTarget: function () {
            return this.control.get('filterInput');
        },

        '_onSetPlaceholder': function (v) {
            this.control.get('placeholderEl').html(v);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: FilterMenuTpl
            }
        },

        HTML_PARSER: {
            placeholderEl: function (el) {
                return el.one('.' + this.getBaseCssClass('placeholder'));
            },
            'filterInputWrap': function (el) {
                return el.one('.' + this.getBaseCssClass('input-wrap'));
            },
            filterInput: function (el) {
                return el.one('.' + this.getBaseCssClass('input'));
            }
        }
    });
});