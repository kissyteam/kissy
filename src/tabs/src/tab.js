/**
 * @ignore
 * Single tab in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab", function (S, Button, TabRender) {

    /**
     * KISSY.Tabs.Tab
     * @class KISSY.Tabs.Tab
     * @extends KISSY.Button
     */
    return Button.extend({
        isTabsTab: true,
        bindUI: function () {
            this.on("click", function () {
                this.set("selected", true);
            });
        }
    }, {
        ATTRS: {
            handleMouseEvents: {
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
                view: 1
            },
            selectedCls: {
                view: 1
            },
            xrender: {
                value: TabRender
            }
        }
    }, {
        xclass: 'tabs-tab',
        priority: 30
    });

}, {
    requires: ['button', './tab-render']
});