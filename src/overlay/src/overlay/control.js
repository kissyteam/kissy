/**
 * @ignore
 * control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/control", function (S, Container, AlignExtension,
                                    Loading, Mask, OverlayRender, OverlayEffect) {

    var HIDE = "hide",
        actions = {
            hide: HIDE,
            destroy: "destroy"
        };
    /**
     * KISSY Overlay Component.
     * xclass: 'overlay'.
     * @class KISSY.Overlay
     * @extends KISSY.Component.Control
     * @mixins KISSY.Component.Extension.Content
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Overlay.Extension.Loading
     * @mixins KISSY.Component.Extension.Align
     * @mixins KISSY.Overlay.Extension.Close
     * @mixins KISSY.Overlay.Extension.Mask
     */
    return Container.extend([
        Loading,
        AlignExtension,
        Mask,
        OverlayEffect
    ], {
        bindUI: function () {
            var self = this,
                closeBtn = self.get("closeBtn");
            if (closeBtn) {
                closeBtn.on("click", function (ev) {
                    self.close();
                    ev.preventDefault();
                });
            }
        },
        /**
         * hide or destroy according to {@link KISSY.Overlay#closeAction}
         * @chainable
         */
        close: function () {
            var self = this;
            self[actions[self.get("closeAction")] || HIDE]();
            return self;
        }
    }, {
        ATTRS: {

            contentEl: {
            },

            /**
             * Whether close button is visible.
             *
             * Defaults to: true.
             *
             * @cfg {Boolean} closable
             */
            /**
             * Whether close button is visible.
             * @type {Boolean}
             * @property closable
             */
            /**
             * @ignore
             */
            closable: {
                value: false,
                view: 1
            },

            /**
             * close button element.
             * @type {KISSY.NodeList}
             * @property closeBtn
             * @readonly
             */
            /**
             * @ignore
             */
            closeBtn: {
                view: 1
            },

            /**
             * Whether to destroy or hide current element when click close button.
             * Can set "destroy" to destroy it when click close button.
             *
             * Defaults to: "hide".
             *
             * @cfg {String} closeAction
             */
            /**
             * @ignore
             */
            closeAction: {
                value: HIDE
            },

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

            visible: {
                value: false
            },

            xrender: {
                value: OverlayRender
            }
        },
        xclass: 'overlay'
    });
}, {
    requires: [
        'component/container',
        'component/extension/align',
        "./extension/loading",
        "./extension/mask",
        './overlay-render',
        './extension/overlay-effect'
    ]
});