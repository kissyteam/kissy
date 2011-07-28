/**
 * menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorrender", function(S, UIBase, Component) {

    var CLS = "menuseparator";
    return UIBase.create(Component.Render, {
        createDom:function() {
            this.get("el").attr("role", "separator").addClass(this.getCls(CLS));
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