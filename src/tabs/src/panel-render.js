/**
 * @ignore
 * single tab panel render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel-render", function (S, Component) {

    return Component.Render.extend({

        initializer: function () {
            var self = this,
                attrs = self.get('elAttrs');
            attrs['role'] = 'tabpanel';
            if (self.get('selected')) {
                self.get('elCls').push(self.getCssClassWithState('selected'));
            } else {
                attrs['aria-hidden'] = false;
            }
        },

        _onSetSelected: function (v) {
            var el = this.get("el");
            var selectedCls = this.getCssClassWithState('selected');
            el[v ? "addClass" : "removeClass"](selectedCls);
            el.attr("aria-hidden", !v);
        }

    }, {
        ATTRS: {
            selected: {
                sync: 0,
                value: false
            }
        },

        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.get('prefixCls') + 'tabs-panel-selected');
            }
        }
    });

}, {
    requires: ['component/base']
});