/**
 * @ignore
 * single tab panel.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    var PanelRender = require('./panel-render');
    /**
     * KISSY.Tabs.Panel.xclass: 'tabs-panel'.
     * @class  KISSY.Tabs.Panel
     * @extends KISSY.Component.Container
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
    });
});