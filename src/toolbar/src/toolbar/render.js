/**
 * @ignore
 * render for toolbar
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');

    return Container.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'toolbar';
        }
    });
});