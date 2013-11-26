/**
 * @ignore
 * separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'separator';
        }
    });
});