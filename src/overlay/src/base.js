/**
 * @ignore
 * controller for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S, Component, Extension, Loading, Close, Mask, OverlayRender, OverlayEffect) {

    /**
     * KISSY Overlay Component.
     * xclass: 'overlay'.
     * @class KISSY.Overlay
     * @extends KISSY.Component.Controller
     * @mixins KISSY.Component.Extension.ContentBox
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Overlay.Extension.Loading
     * @mixins KISSY.Component.Extension.Align
     * @mixins KISSY.Overlay.Extension.Close
     * @mixins KISSY.Overlay.Extension.Mask
     */
    return Component.Controller.extend([
        Extension.Position,
        Loading,
        Extension.Align,
        Close,
        Mask,
        OverlayEffect
    ], {}, {
        ATTRS: {

            /**
             * overlay can not have focus.
             *
             * Defaults to: false.
             *
             * @cfg {Boolean} focusable
             * @protected
             */
            /**
             * @ignore
             */
            focusable: {
                value: false
            },

            /**
             * overlay can have text selection.
             *
             * Defaults to: true.
             *
             * @cfg {Boolean} allowTextSelection
             * @protected
             */
            /**
             * @ignore
             */
            allowTextSelection: {
                value: true
            },

            /**
             * whether this component can be closed.
             *
             * Defaults to: false
             *
             * @cfg {Boolean} closable
             */
            /**
             * @ignore
             */
            closable: {
                value: false
            },

            /**
             * whether this component can be responsive to mouse.
             *
             * Defaults to: false
             *
             * @cfg {Boolean} handleMouseEvents
             * @protected
             */
            /**
             * @ignore
             */
            handleMouseEvents: {
                value: false
            },
            xrender: {
                value: OverlayRender
            }
        }
    }, {
        xclass: 'overlay',
        priority: 10
    });
}, {
    requires: [
        'component/base',
        'component/extension',
        "./extension/loading",
        "./extension/close",
        "./extension/mask",
        './overlay-render',
        './extension/overlay-effect'
    ]
});