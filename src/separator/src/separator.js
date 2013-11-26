/**
 * @ignore
 * separator def
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    var SeparatorRender = require('separator/render');

    /**
     * separator component for KISSY. xclass: 'separator'.
     * @extends KISSY.Component.Control
     * @class KISSY.Separator
     */
    return Control.extend({
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

            handleMouseEvents: {
                value: false
            },

            xrender: {
                value: SeparatorRender
            }
        },
        xclass: 'separator'
    });
});