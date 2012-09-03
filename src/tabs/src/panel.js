/**
 * @fileOverview single tab panel.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel", function (S, Component, PanelRender) {

    return Component.Controller.extend({

    }, {
        ATTRS: {
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
    requires: ['component', './panel-render']
});