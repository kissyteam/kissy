/**
 * @fileOverview menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorrender", function(S, UIBase, Component) {

    return UIBase.create(Component.Render, {
        createDom:function() {
            this.get("el").attr("role", "separator");
        }
    });

}, {
    requires:['uibase','component']
});