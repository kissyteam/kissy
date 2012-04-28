/**
 * @fileOverview submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function (S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
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
        }, "Menu_SubMenu_Render");
        return SubMenuRender;
    },
    {
        requires:['uibase', './menuitemrender']
    });