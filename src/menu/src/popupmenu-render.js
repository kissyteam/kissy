/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, extension, MenuRender) {

    var UA= S.UA;

    return MenuRender.extend([
        extension.ContentBox.Render,
        extension.Position.Render,
        UA['ie'] === 6 ? extension.Shim.Render : null
    ]);
}, {
    requires:['component/extension', './menu-render']
});