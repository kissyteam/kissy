/**
 * @ignore
 * single tab panel.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    /**
     * KISSY.Tabs.Panel.xclass: 'tabs-panel'.
     * @class  KISSY.Tabs.Panel
     * @extends KISSY.Component.Container
     */
    return Container.extend({
        isTabsPanel: 1,

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
            el[v ? 'addClass' : 'removeClass'](selectedCls)
                .attr('aria-hidden', !v);
        }
    }, {
        ATTRS: {
            /**
             * whether selected
             * @cfg {Boolean} selected
             */
            /**
             * @ignore
             */
            selected: {
                render: 1,
                sync: 0,
                parse: function (el) {
                    return el.hasClass(this.getBaseCssClass('selected'));
                }
            },
            focusable: {
                value: false
            },
            allowTextSelection: {
                value: true
            }
        },
        xclass: 'tabs-panel'
    });
});