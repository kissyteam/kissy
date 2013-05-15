/**
 * @ignore
 * Tabs render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/render", function (S, Component) {
    var CLS = "tabs-top tabs-bottom tabs-left tabs-right";
    return Component.Render.extend({

        initializer: function () {
            this.get('elCls').push(this.getCssClassWithPrefix("tabs-" +
                this.get('barOrientation')))
        },

        '_onSetBarOrientation': function (v) {
            var self = this,
                el = self.get("el");
            el.removeClass(self.getCssClassWithPrefix(CLS))
                .addClass(self.getCssClassWithPrefix("tabs-" + v));
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
                var orientation = el[0].className.match(/tabs-(top|bottom|left|right)\b/);
                return orientation && orientation[1] || "top";
            }
        }
    });
}, {
    requires: ['component/base']
});