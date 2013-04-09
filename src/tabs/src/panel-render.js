/**
 * @ignore
 * single tab panel render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel-render", function (S, Component) {

    return Component.Render.extend({

        createDom: function () {
            this.get("el").attr("role", "tabpanel");
        },

        _onSetSelected: function (v) {
            var el = this.get("el");
            var selectedCls= this.get('prefixCls')+'tabs-panel-selected';
            el[v ? "addClass" : "removeClass"](selectedCls);
            el.attr("aria-hidden", !v);
        }

    }, {
        ATTRS: {
            selected: {
                value: false
            }
        },

        HTML_PARSER: {
            selected: function (el) {
                var selectedCls= this.get('prefixCls')+'tabs-panel-selected';
                return el.hasClass(selectedCls);
            }
        }
    });

}, {
    requires: ['component/base']
});