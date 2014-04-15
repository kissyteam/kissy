/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:56
*/
/*
combined files : 

separator

*/
/**
 * @ignore
 * separator def
 * @author yiminghe@gmail.com
 */
KISSY.add('separator',['component/control'], function (S, require) {
    var Control = require('component/control');

    /**
     * separator component for KISSY. xclass: 'separator'.
     * @extends KISSY.Component.Control
     * @class KISSY.Separator
     */
    return Control.extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'separator';
        }
    }, {
        ATTRS: {

            /**
             * Un-focusable.
             * readonly.
             * Defaults to: false.
             */
            focusable: {
                value: false
            },

            disabled: {
                value: true
            },

            handleGestureEvents: {
                value: false
            }
        },
        xclass: 'separator'
    });
});
