/**
 * @ignore
 * control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    var Shim = require('component/extension/shim');
    var AlignExtension = require('component/extension/align');
    var Loading = require('./extension/loading');
    var Mask = require('./extension/mask');
    var OverlayEffect = require('./extension/overlay-effect');
    var ContentBox = require('component/extension/content-box');
    var OverlayTpl = require('./overlay-xtpl');
    var HIDE = 'hide',
        actions = {
            hide: HIDE,
            destroy: 'destroy'
        };
    /**
     * KISSY Overlay Component.
     * xclass: 'overlay'.
     * @class KISSY.Overlay
     * @extends KISSY.Component.Container
     * @mixins KISSY.Component.Extension.Shim
     * @mixins KISSY.Overlay.Extension.Effect
     * @mixins KISSY.Overlay.Extension.Loading
     * @mixins KISSY.Component.Extension.Align
     * @mixins KISSY.Overlay.Extension.Mask
     */
    return Container.extend([
        ContentBox,
        Shim,
        Loading,
        AlignExtension,
        Mask,
        OverlayEffect
    ], {
        createDom:function(){
            this.fillChildrenElsBySelectors({
                closeBtn: '#ks-overlay-close-{id}'
            });
        },

        bindUI: function () {
            var self = this,
                closeBtn = self.get('closeBtn');
            if (closeBtn) {
                closeBtn.on('click', function (ev) {
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
            self[actions[self.get('closeAction')] || HIDE]();
            return self;
        }
    }, {
        HTML_PARSER: {
            closeBtn: function (el) {
                return el.one('.' + this.getBaseCssClass('close'));
            }
        },
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
                sync:0,
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
            },

            /**
             * Whether to destroy or hide current element when click close button.
             * Can set 'destroy' to destroy it when click close button.
             *
             * Defaults to: 'hide'.
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
             * @cfg {Boolean} handleGestureEvents
             * @protected
             */
            /**
             * @ignore
             */
            handleGestureEvents: {
                value: false
            },

            visible: {
                value: false
            },

            contentTpl: {
                value: OverlayTpl
            }
        },
        xclass: 'overlay'
    });
});