/**
 * @fileOverview menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorRender", function (S, UIBase, Component) {

    return UIBase.create(Component.Render, {
        createDom:function () {
            this.get("el").attr("role", "separator");
        }
    }, "Menu_Separator_Render");

}, {
    requires:['uibase', 'component']
});