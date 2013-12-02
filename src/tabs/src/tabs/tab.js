/**
 * @ignore
 * Single tab in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Button = require('button');
    var TabRender = require('./tab-render');
    /**
     * KISSY.Tabs.Tab. xclass:'tabs-tab'
     * @class KISSY.Tabs.Tab
     * @extends KISSY.Button
     */
    return Button.extend({
        isTabsTab: true,

        bindUI: function () {
            this.on('click', function () {
                this.set('selected', true);
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
            xrender: {
                value: TabRender
            }
        },
        xclass: 'tabs-tab'
    });
});