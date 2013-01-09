/**
 *  separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("separator/separatorRender", function (S, Component) {

    return Component.Render.extend({
        createDom:function () {
            this.get("el").attr("role", "separator");
        }
    });

}, {
    requires:['component/base']
});