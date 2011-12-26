/**
 * @fileOverview submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function(S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
            renderUI:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl");
                el.attr("aria-haspopup", "true");
                contentEl.append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            },
            _uiSetContent:function(v) {
                var self = this;
                SubMenuRender.superclass._uiSetContent.call(self, v);
                self.get("contentEl").append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            }

        });
        return SubMenuRender;
    },
    {
        requires:['uibase','./menuitemrender']
    });