/**
 * @fileOverview single tab panel render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel-render", function (S, Component) {

    var SELECTED_CLS = "ks-tabs-panel-selected";

    return Component.Render.extend({

        createDom: function () {
            this.get("el").attr("role", "tabpanel");
        },

        _uiSetSelected: function (v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](SELECTED_CLS);
            el.attr("aria-hidden", !v);
        }

    }, {
        ATTRS: {
            selected: {
                value: false
            }

        }
    }, {
        xclass: 'tabs-panel'
    })

}, {
    requires: ['component']
});