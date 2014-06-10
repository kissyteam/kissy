/**
 * @ignore
 * separator def
 * @author yiminghe@gmail.com
 */

var Control = require('component/control');

/**
 * separator component for KISSY. xclass: 'separator'.
 * @extends KISSY.Component.Control
 * @class KISSY.Separator
 */
module.exports = Control.extend({
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