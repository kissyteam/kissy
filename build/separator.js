/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 21 01:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 separator/render
 separator
*/

/**
 * separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("separator/render", function (S, Controller) {

    return Controller.ATTRS.xrender.value.extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'separator';
        }
    });

}, {
    requires: ['component/controller']
});
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

