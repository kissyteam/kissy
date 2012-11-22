/**
 * @ignore
 * @fileOverview popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, UA, extension, MenuRender) {

    return MenuRender.extend([
        extension.ContentBox.Render,
        extension.Position.Render,
        UA['ie'] === 6 ? extension.Shim.Render : null
    ]);
}, {
    requires:['ua', 'component/extension', './menu-render']
});