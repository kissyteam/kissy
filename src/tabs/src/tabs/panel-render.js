/**
 * @ignore
 * single tab panel render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel-render", function (S, Container) {

    return Container.ATTRS.xrender.value.extend({

        beforeCreateDom: function (renderData) {
            var self = this;
            renderData.elAttrs.role = 'tabpanel';
            if (renderData.selected) {
                renderData.elCls.push(self.getBaseCssClasses('selected'));
            } else {
                renderData.elAttrs['aria-hidden'] = false;
            }
        },

        _onSetSelected: function (v) {
            var el = this.$el;
            var selectedCls = this.getBaseCssClasses('selected');
            el[v ? "addClass" : "removeClass"](selectedCls)
                .attr("aria-hidden", !v);
        }

    }, {
        name: 'TabsPanelRender',
        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.getBaseCssClass('selected'));
            }
        }
    });

}, {
    requires: ['component/container']
});