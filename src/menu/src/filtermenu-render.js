/**
 * @ignore
 * filter menu render
 * 1.create filter input
 * 2.change menu content element
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu-render", function (S, Node, MenuRender, FilterMenuTpl, Extension) {

    return MenuRender.extend([Extension.ContentRender], {
        initializer: function () {
            var childrenElSelectors = this.get('childrenElSelectors');
            S.mix(childrenElSelectors, {
                placeholderEl: '#ks-filter-menu-placeholder{id}',
                filterInputWrap: '#ks-filter-menu-input-wrap{id}',
                filterInput: '#ks-filter-menu-input{id}'
            });
        },

        getKeyEventTarget: function () {
            return this.get("filterInput");
        },

        '_onSetPlaceholder': function (v) {
            this.get("placeholderEl").html(v);
        }
    }, {
        ATTRS: {
            placeholder: {
                sync: 0
            },
            contentTpl: {
                value: FilterMenuTpl
            }
        },

        HTML_PARSER: {
            placeholderEl: function (el) {
                return el.one("." + this.getBaseCssClass('placeholder'))
            },
            'filterInputWrap': function (el) {
                return el.one("." + this.getBaseCssClass('input-wrap'));
            },
            filterInput: function (el) {
                return el.one("." + this.getBaseCssClass('input'));
            }
        }
    });

}, {
    requires: ['node', './menu-render', './filtermenu-tpl', 'component/extension']
});