/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, ContentRenderExtension, MenuRender) {

    return MenuRender.extend([
        ContentRenderExtension
    ]);

}, {
    requires: [
        'component/extension/content-render',
        './menu-render'
    ]
});