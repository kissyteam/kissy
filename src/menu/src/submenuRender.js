/**
 * @fileOverview submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenuRender", function (S, MenuItemRender) {
    var SubMenuRender,
        ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';

    SubMenuRender = MenuItemRender.extend({
        renderUI:function () {
            var self = this,
                el = self.get("el");
            el.attr("aria-haspopup", "true")
                .append(S.substitute(ARROW_TMPL, {
                prefixCls:this.get("prefixCls")
            }));
        },
        _uiSetHtml:function (v) {
            var self = this;
            SubMenuRender.superclass._uiSetHtml.call(self, v);
            self.get("el").append(S.substitute(ARROW_TMPL, {
                prefixCls:this.get("prefixCls")
            }));
        }
    });

    return SubMenuRender;
}, {
    requires:['./menuitemRender']
});