/**
 * @fileOverview menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorRender", function (S, Component) {

    return Component.define(Component.Render, {
        createDom:function () {
            this.get("el").attr("role", "separator");
        }
    }, "Menu_Separator_Render");

}, {
    requires:['component']
});