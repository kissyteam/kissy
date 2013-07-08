/**
 * @ignore
 * Tabs render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/render", function (S, Container) {

    var CLS = "top bottom left right";

    return Container.ATTRS.xrender.value.extend({

        beforeCreateDom: function (renderData) {
            renderData.elCls
                .push(this.getBaseCssClass(this.control.get('barOrientation')))
        },

        decorateDom: function () {
            var control = this.control;
            control.get('bar').set('changeType', control.get('changeType'));
        },

        '_onSetBarOrientation': function (v) {
            var self = this,
                el = self.$el;
            el.removeClass(self.getBaseCssClass(CLS))
                .addClass(self.getBaseCssClass(v));
        }

    }, {
        name:'TabsRender',
        HTML_PARSER: {
            barOrientation: function (el) {
                var orientation = el[0].className.match(/(top|bottom|left|right)\b/);
                return orientation && orientation[1] || "top";
            }
        }
    });
}, {
    requires: ['component/container']
});