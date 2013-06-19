/**
 * @ignore
 * single tab panel.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel", function (S, Container, PanelRender) {

    /**
     * KISSY.Tabs.Panel
     * @class  KISSY.Tabs.Panel
     * @extends KISSY.Component.Controller
     */
    return Container.extend({
        isTabsPanel: 1
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
                view: 1
            },
            focusable: {
                value: false
            },
            allowTextSelection: {
                value: true
            },
            xrender: {
                value: PanelRender
            }
        },
        xclass: 'tabs-panel'
    })

}, {
    requires: ['component/container', './panel-render']
});