/**
 * @fileOverview Single tab render in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab-render", function (S, Button) {

    var CLS = 'ks-tabs-tab-selected';

    return Button.Render.extend({
        createDom: function () {
            this.get("el").attr("role", "tab");
        },
        _uiSetSelected: function (v) {
            var el = this.get("el");
            el[v ? 'addClass' : 'removeClass'](CLS);
            el.attr('aria-selected', !!v);
        }
    }, {
        ATTRS: {
            selected: {
                value: false
            }
        }
    }, {
        xclass: 'tabs-tab'
    });

}, {
    requires: ['button']
});