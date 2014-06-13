/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:53
*/
/*
combined modules:
separator
*/
KISSY.add('separator', ['component/control'], function (S, require, exports, module) {
    /**
 * @ignore
 * separator def
 * @author yiminghe@gmail.com
 */
    var Control = require('component/control');    /**
 * separator component for KISSY. xclass: 'separator'.
 * @extends KISSY.Component.Control
 * @class KISSY.Separator
 */
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
            focusable: { value: false },
            disabled: { value: true },
            handleGestureEvents: { value: false }
        },
        xclass: 'separator'
    });
});
