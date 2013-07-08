/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, ContentRenderExtension, ShimRenderExtension, MenuRender) {

    return MenuRender.extend([
        ContentRenderExtension,
        ShimRenderExtension
    ]);

}, {
    requires: ['component/extension/content-render',
        'component/extension/shim-render',
        './menu-render']
});