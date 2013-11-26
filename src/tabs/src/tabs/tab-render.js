/**
 * @ignore
 * Single tab render in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Button = require('button');

    return Button.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            var attrs = renderData.elAttrs;
            attrs.role = 'tab';
            if (renderData.selected) {
                attrs['aria-selected'] = true;
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
        },
        _onSetSelected: function (v) {
            var el = this.$el;
            var selectedCls = this.getBaseCssClasses('selected');
            el[v ? 'addClass' : 'removeClass'](selectedCls)
                .attr('aria-selected', !!v);
        }
    }, {
        name:'TabsTabRender',
        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.getBaseCssClass('selected'));
            }
        }
    });

});