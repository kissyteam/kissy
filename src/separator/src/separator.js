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
        handleGestureEvents: {
            value: false
        },

        focusable: {
            value: false
        },

        allowTextSelection: {
            value: false
        },

        disabled: {
            value: true
        }
    },
    xclass: 'separator'
});