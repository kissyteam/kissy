/**
 * @ignore
 * Single tab render in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab-render", function (S, Button) {

    return Button.Render.extend({
        createDom: function () {
            this.get("el").attr("role", "tab");
        },
        _onSetSelected: function (v) {
            var el = this.get("el");
            var selectedCls = this.get('prefixCls') + 'tabs-tab-selected';
            el[v ? 'addClass' : 'removeClass'](selectedCls);
            el.attr('aria-selected', !!v);
        }
    }, {
        ATTRS: {
            selected: {
                value: false
            }
        },
        HTML_PARSER: {
            selected: function (el) {
                var selectedCls = this.get('prefixCls') + 'tabs-tab-selected';
                return el.hasClass(selectedCls);
            }
        }
    });

}, {
    requires: ['button']
});