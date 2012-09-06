/**
 * @fileOverview submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenuRender", function (S, MenuItemRender) {
    var SubMenuRender,
        CONTENT_TMPL = '<span class="{prefixCls}menuitem-content"><' + '/span>',
        ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';

    SubMenuRender = MenuItemRender.extend({
        createDom: function () {
            var self = this,
                el = self.get("el");
            el.attr("aria-haspopup", "true")
                .append(S.substitute(ARROW_TMPL, {
                prefixCls: self.get('prefixCls')
            }));
        }
    }, {
        ATTRS: {
            arrowEl: {},
            contentEl: {
                valueFn: function () {
                    return S.all(S.substitute(CONTENT_TMPL, {
                        prefixCls: self.get('prefixCls')
                    }));
                }
            }
        },
        HTML_PARSER: {
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') + "menuitem-content");
            }
        }
    });

    return SubMenuRender;
}, {
    requires: ['./menuitemRender']
});