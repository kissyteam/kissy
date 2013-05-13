/**
 * @ignore
 * filter menu render
 * 1.create filter input
 * 2.change menu content element
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu-render", function (S, Node, MenuRender, FilterMenuTpl) {
    var MENU_FILTER = "menu-filter",
        MENU_FILTER_LABEL = "menu-filter-label",
        MENU_FILTER_INPUT = "menu-filter-input",
        MENU_CONTENT = "menu-content";

    return MenuRender.extend({
        initializer: function () {
            var childrenElSelectors = this.get('childrenElSelectors');
            S.mix(childrenElSelectors, {
                labelEl: '#' + MENU_FILTER_LABEL + '{id}',
                filterWrap: '#' + MENU_FILTER + '{id}',
                menuContent: '#' + MENU_CONTENT + '{id}',
                filterInput: '#' + MENU_FILTER_INPUT + '{id}'
            });
        },

        getChildrenContainerEl: function () {
            return this.get("menuContent");
        },

        getKeyEventTarget: function () {
            return this.get("filterInput");
        },

        '_onSetLabel': function (v) {
            this.get("labelEl").html(v);
        }
    }, {
        ATTRS: {
            label: {
                sync: 0
            },
            contentTpl: {
                value: FilterMenuTpl
            }
        },

        HTML_PARSER: {
            labelEl: function (el) {
                return el.one("." + this.get('prefixCls') + MENU_FILTER_LABEL)
            },
            'filterWrap': function (el) {
                return el.one("." + this.get('prefixCls') + MENU_FILTER);
            },
            menuContent: function (el) {
                return el.one("." + this.get('prefixCls') + MENU_CONTENT);
            },
            filterInput: function (el) {
                return el.one("." + this.get('prefixCls') + MENU_FILTER_INPUT);
            }
        }
    });

}, {
    requires: ['node', './menu-render', './filtermenu-tpl']
});