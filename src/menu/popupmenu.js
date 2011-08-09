/**
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function(S, UIBase, Component, Menu, PopupMenuRender) {
    var PopMenu = UIBase.create(Menu, [
        UIBase.Position,
        UIBase.Align
    ], {
    }, {
        DefaultRender:PopupMenuRender
    });

    Component.UIStore.setUIByClass("popupmenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:PopMenu
    });

    return PopMenu;

}, {
    requires:['uibase','component','./menu','./popupmenurender']
});