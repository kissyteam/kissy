/**
 * separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("separator", function (S, Controller, SeparatorRender) {

    /**
     * @extends KISSY.Component.Controller
     * @class
     * separator.
     * xclass: 'separator'.
     * @name Separator
     */
    return Controller.extend({
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

}, {
    requires: ['component/controller', 'separator/render']
});