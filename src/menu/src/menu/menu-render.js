/**
 * @ignore
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu-render", function (S, Container) {

    return Container.ATTRS.xrender.value.extend({

        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'menu';
        },

        containsElement: function (element) {
            var $el = this.$el;
            return $el && ($el[0] === element || $el.contains(element));
        }
    });
}, {
    requires: ['component/container']
});