/**
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenurender", function(S, UA, UIBase, MenuRender) {
    var CLS = "{prefixCls}popmenu";
    return UIBase.create(MenuRender, [
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ], {
        renderUI:function() {
            this.get("el").addClass(S.substitute(CLS, {
                prefixCls:this.get("prefixCls")
            }));
        }
    }, {
        ATTRS:{
            // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
            focusable:{
                value:false
            },
            visibleMode:{
                value:"visibility"
            }
        }
    });
}, {
    requires:['ua','uibase','./menurender']
});