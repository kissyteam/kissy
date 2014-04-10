/**
 * @ignore
 * Single tab in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Button = require('button');

    /**
     * KISSY.Tabs.Tab. xclass:'tabs-tab'
     * @class KISSY.Tabs.Tab
     * @extends KISSY.Button
     */
    return Button.extend({
        isTabsTab: true,

        beforeCreateDom: function (renderData) {
            var attrs = renderData.elAttrs;
            attrs.role = 'tab';
            if (renderData.selected) {
                attrs['aria-selected'] = true;
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
        },

        handleClickInternal: function (e) {
            this.callSuper(e);
            this.set('selected', true);
        },

        _onSetSelected: function (v) {
            var el = this.$el;
            var selectedCls = this.getBaseCssClasses('selected');
            el[v ? 'addClass' : 'removeClass'](selectedCls)
                .attr('aria-selected', !!v);
        }
    }, {
        ATTRS: {
            handleGestureEvents: {
                value: false
            },
            focusable: {
                value: false
            },
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
            }
        },
        xclass: 'tabs-tab'
    });
});