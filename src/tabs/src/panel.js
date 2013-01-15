/**
 * @ignore
 * single tab panel.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel", function (S, Component, PanelRender) {

    /**
     * KISSY.Tabs.Panel
     * @class  KISSY.Tabs.Panel
     * @extends KISSY.Component.Controller
     */
    return Component.Controller.extend({

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
            selectedCls: {
                view: 1
            },
            xrender: {
                value: PanelRender
            }
        }
    }, {
        xclass: 'tabs-panel'
    })

}, {
    requires: ['component/base', './panel-render']
});