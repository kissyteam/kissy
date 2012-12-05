/**
 * @ignore
 * @fileOverview controller for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S, Component,
                                    Extension,
                                    Loading,
                                    Close,
                                    Mask,
                                    OverlayRender) {

    var NONE = 'none',
        DURATION = 0.5,
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function getGhost(self) {
        var el = self.get("el"), $ = S.all;
        var ghost = el[0].cloneNode(true);
        ghost.style.visibility = "";
        ghost.style.overflow = "hidden";
        ghost.className += " " + self.get("prefixCls") + "overlay-ghost";
        var body, elBody;
        if (elBody = self.get("body")) {
            body = $('.' + self.get('prefixCls') + 'stdmod-body', ghost);
            body.css({
                height: elBody.height(),
                width: elBody.width()
            });
            body.html('')
        }
        return $(ghost);
    }

    function processTarget(self, show, callback) {

        if (self.__effectGhost) {
            self.__effectGhost.stop(1);
        }

        var el = self.get("el"),
            $ = S.all,
            effectCfg = self.get("effect"),
            target = $(effectCfg.target),
            duration = effectCfg.duration,
            targetBox = S.mix(target.offset(), {
                width: target.width(),
                height: target.height()
            }),
            elBox = S.mix(el.offset(), {
                width: el.width(),
                height: el.height()
            }),
            from, to,
            ghost = getGhost(self),
            easing = effectCfg.easing;


        ghost.insertAfter(el);

        el.hide();

        if (show) {
            from = targetBox;
            to = elBox;
        } else {
            from = elBox;
            to = targetBox;
        }

        ghost.css(from);

        self.__effectGhost = ghost;

        ghost.animate(to, {
            duration: duration,
            easing: easing,
            complete: function () {
                self.__effectGhost = null;
                ghost.remove();
                el.show();
                callback();
            }
        });

    }

    function processEffect(self, show, callback) {
        var el = self.get("el"),
            effectCfg = self.get("effect"),
            effect = effectCfg.effect || NONE,
            target = effectCfg.target;
        if (effect == NONE && !target) {
            callback();
            return;
        }
        if (target) {
            processTarget(self, show, callback);
            return;
        }
        var duration = effectCfg.duration,
            easing = effectCfg.easing,
        // need to get before stop, in case anim 's complete function change it
            originalVisibility = el.css('visibility'),
            index = show ? 1 : 0;
        // 队列中的也要移去
        // run complete fn to restore window's original height
        el.stop(1, 1);
        el.css({
            // must show, override box-render _onSetVisible
            "visibility": "visible",
            // fadeIn need display none, fadeOut need display block
            "display": show ? 'none' : 'block'
        });
        var m = effect + effects[effect][index];
        el[m](duration, function () {
            el.css({
                // need compute coordinates when show, so do not use display none for hide
                "display": 'block',
                // restore to box-render _onSetVisible
                "visibility": originalVisibility
            });
            callback();
        }, easing);
    }

    /**
     * KISSY Overlay Component. xclass: 'overlay'.
     * @class KISSY.Overlay
     * @extends KISSY.Component.Controller
     * @mixins KISSY.Component.Extension.ContentBox
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Overlay.Extension.Loading
     * @mixins KISSY.Component.Extension.Align
     * @mixins KISSY.Overlay.Extension.Close
     * @mixins KISSY.Overlay.Extension.Resize
     * @mixins KISSY.Overlay.Extension.Mask
     */
    var Overlay = Component.Controller.extend([
        Extension.ContentBox,
        Extension.Position,
        Loading,
        Extension.Align,
        Close,
        Mask
    ],{
            /**
             * For overlay with effect, it should listen show and hide instead of afterVisibleChange.
             * @protected
             */
            _onSetVisible: function (v) {
                var self = this;
                if (self.get('rendered')) {
                    // delay show and hide event after anim
                    processEffect(self, v, function () {
                        self.fire(v ? 'show' : 'hide');
                    });
                }
            }

        }, {
            ATTRS: {

                /**
                 * Set v as overlay 's show effect
                 *
                 * - v.effect (String): Default:none.
                 * can be set as "fade" or "slide"
                 *
                 * - v.target (String|KISS.Node):
                 * The target node from which overlay should animate from while showing.
                 *
                 * - v.duration (Number): in seconds.
                 * Default:0.5.
                 *
                 * - v.easing (String|Function):
                 * for string see {@link KISSY.Anim.Easing} 's method name.
                 *
                 * @cfg {Object} effect
                 */
                /**
                 * @ignore
                 */
                effect: {
                    value: {
                        effect: '',
                        target: null,
                        duration: DURATION,
                        easing: 'easeOut'
                    },
                    setter: function (v) {
                        var effect = v.effect;
                        if (typeof effect == 'string' && !effects[effect]) {
                            v.effect = '';
                        }
                    }

                },

                /**
                 * overlay can not have focus.
                 *
                 * Defaults to: false.
                 *
                 * @cfg {boolean} focusable
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
                 * @cfg {boolean} allowTextSelection
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

    return Overlay;
}, {
    requires: [
        'component/base',
        'component/extension',
        "./extension/loading",
        "./extension/close",
        "./extension/mask",
        './overlay-render']
});