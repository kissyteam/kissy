/**
 * @fileOverview popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenuRender", function (S, UA, Component, MenuRender) {
    var UIBase = Component.UIBase;
    return Component.define(MenuRender, [
        UIBase.ContentBox.Render,
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ], "Menu_PopupMenu_Render");
}, {
    requires:['ua', 'component', './menuRender']
});