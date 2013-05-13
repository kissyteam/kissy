/**
 * @ignore
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu-render", function (S, MenuItemRender, SubMenuTpl) {

    return MenuItemRender.extend({
        initializer: function () {
            this.get('childrenElSelectors')['contentEl'] =
                '#{prefixCls}menuitem-content{id}';
        },

        _onSetContent: function (v) {
            this.get('contentEl').html(v).unselectable();
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: SubMenuTpl
            }
        },
        HTML_PARSER: {
            content: function () {
                return el.children("." + this.get('prefixCls') +
                    "menuitem-content").html();
            },
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') +
                    "menuitem-content");
            }
        }
    });
}, {
    requires: ['./menuitem-render', './submenu-tpl']
});