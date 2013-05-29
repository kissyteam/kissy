/**
 * @ignore
 * Tabs render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/render", function (S, Component) {
    var CLS = "top bottom left right";
    return Component.Render.extend({

        initializer: function () {
            this.get('elCls').push(this.getBaseCssClass(this.get('barOrientation')))
        },

        '_onSetBarOrientation': function (v) {
            var self = this,
                el = self.get("el");
            el.removeClass(self.getBaseCssClass(CLS))
                .addClass(self.getBaseCssClass(v));
        }

    }, {
        ATTRS: {
            barOrientation: {
                sync: 0,
                value: 'top'
            }
        },
        HTML_PARSER: {
            barOrientation: function (el) {
                var orientation = el[0].className.match(/(top|bottom|left|right)\b/);
                return orientation && orientation[1] || "top";
            }
        }
    });
}, {
    requires: ['component/base']
});