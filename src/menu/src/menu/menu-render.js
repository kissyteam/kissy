/**
 * @ignore
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    return Container.getDefaultRender().extend({

        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'menu';
        },

        containsElement: function (element) {
            var $el = this.$el;
            return $el && ($el[0] === element || $el.contains(element));
        }
    });
});