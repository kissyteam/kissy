/**
 * @ignore
 * separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("separator/render", function (S, Control) {

    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'separator';
        }
    });

}, {
    requires: ['component/control']
});