/**
 * menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorrender", function(S, UIBase, Component) {

    var CLS = "{prefixCls}menuseparator";
    return UIBase.create(Component.Render, {

        createDom:function() {
            var el = this.get("el");
            el.attr("role", "separator").addClass(S.substitute(CLS, {
                prefixCls:this.get("prefixCls")
            }));
        }

    }, {
        ATTRS:{
            focusable:{
                value:false
            },
            // 分隔线禁用，不可以被键盘访问
            disabled:{
                value:true
            }
        }
    });

}, {
    requires:['uibase','component']
});