/**
 * separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("separator/separator-render", function (S, Component) {

    return Component.Render.extend({
        initializer: function () {
            this.get('elAttrs')['role'] = 'separator';
        }
    });

}, {
    requires: ['component/base']
});