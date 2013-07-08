/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:58
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
KISSY.add("separator/render", function (S, Control) {

    return Control.ATTRS.xrender.value.extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'separator';
        }
    });

}, {
    requires: ['component/control']
});
/**
 * separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("separator", function (S, Control, SeparatorRender) {

    /**
     * @extends KISSY.Component.Control
     * @class
     * separator.
     * xclass: 'separator'.
     * @name Separator
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

}, {
    requires: ['component/control', 'separator/render']
});

