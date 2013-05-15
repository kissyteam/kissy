/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, Extension, MenuRender) {

    return MenuRender.extend([
        Extension.ContentRender,
        Extension.PositionRender,
        Extension.ShimRender
    ]);

}, {
    requires: ['component/extension', './menu-render']
});