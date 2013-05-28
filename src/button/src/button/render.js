/**
 * @ignore
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/render", function (S, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Component.Render.extend({
        initializer: function () {
            // set wai-aria role
            var attrs = this.get('elAttrs');
            var renderData = this.get('renderData');
            S.mix(attrs, {
                role: 'button',
                title: renderData.tooltip,
                'aria-describedby': renderData.describedby
            });
            if (renderData.checked) {
                this.get('elCls').push(self.getBaseCssClasses("checked"));
            }
        },
        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getBaseCssClasses("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },
        '_onSetTooltip': function (title) {
            this.get("el").attr("title", title);
        },
        '_onSetDescribedby': function (describedby) {
            this.get("el").attr("aria-describedby", describedby);
        }
    }, {
        ATTRS: {
            describedby: {
                sync: 0
            },
            tooltip: {
                sync: 0
            },
            checked: {
                sync: 0
            }
        }
    });
}, {
    requires: ['component/base']
});