/**
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function(S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►</span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
            renderUI:function() {
                this.get("el").addClass(this.get("prefixCls") + "submenu");
                this.get("el").attr("aria-haspopup", "true");
            },
            _uiSetContent:function(v) {
                this.get("el").one("." + this.get("prefixCls")
                    + "menuitem-content").html(v + S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            }

        });
        return SubMenuRender;
    },
    {
        requires:['uibase','./menuitemrender']
    });