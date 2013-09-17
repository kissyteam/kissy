/**
 * @ignore
 * render for toolbar
 * @author yiminghe@gmail.com
 */
KISSY.add('toolbar/render', function (S, Container) {
    return Container.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'toolbar';
        }
    });
}, {
    requires: ['component/container']
});