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
            el[v ? "addClass" : "removeClass"](this.get("selectedCls"));
            el.attr("aria-hidden", !v);
        }

    }, {
        ATTRS: {
            selected: {
                value: false
            },
            selectedCls: {
                valueFn:function(){
                    return this.get('prefixCls')+'tabs-panel-selected';
                }
            }
        },

        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.get("selectedCls"));
            }
        }
    });

}, {
    requires: ['component/base']
});