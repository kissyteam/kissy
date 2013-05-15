/**
 * @ignore
 * Single tab render in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab-render", function (S, Button) {

    return Button.Render.extend({
        initializer: function () {
            var attrs = this.get('elAttrs');
            attrs.role = 'tab';
            if (this.get('selected')) {
                attrs['aria-selected'] = true;
                this.get('elCls').push(this.getCssClassWithState('selected'));
            }
        },
        _onSetSelected: function (v) {
            var el = this.get("el");
            var selectedCls = this.getCssClassWithState('selected');
            el[v ? 'addClass' : 'removeClass'](selectedCls);
            el.attr('aria-selected', !!v);
        }
    }, {
        ATTRS: {
            selected: {
                value: false,
                sync: 0
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