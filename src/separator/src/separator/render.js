/**
 * separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("separator/render", function (S, Controller) {

    return Controller.ATTRS.xrender.value.extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'separator';
        }
    });

}, {
    requires: ['component/controller']
});