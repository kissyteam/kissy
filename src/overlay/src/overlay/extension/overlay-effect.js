/**
 * @ignore
 * effect for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    var effects = {fade: ['Out', 'In'], slide: ['Up', 'Down']};

    function getGhost(self) {
        var el = self.$el,
            ghost = el.clone(true);

        ghost.css({
            visibility: 'visible',
            overflow: 'hidden'
        }).addClass(self.get('prefixCls') + 'overlay-ghost');

        return self.__afterCreateEffectGhost(ghost);
    }

    function processTarget(self, show) {
        if (self.__effectGhost) {
            self.__effectGhost.stop(1, 1);
        }

        var el = self.$el,
            $ = S.all,
            effectCfg = self.get('effect'),
            target = $(effectCfg.target),
            duration = effectCfg.duration,
            targetBox = {
                width: target.width(),
                height: target.height()
            },
            targetOffset = target.offset(),
            elBox = {
                width: el.width(),
                height: el.height()
            },
            elOffset = el.offset(),
            from, to, fromOffset, toOffset,
            ghost = getGhost(self),
            easing = effectCfg.easing;

        ghost.insertAfter(el);

        if (show) {
            from = targetBox;
            fromOffset = targetOffset;
            to = elBox;
            toOffset = elOffset;
        } else {
            from = elBox;
            fromOffset = elOffset;
            to = targetBox;
            toOffset = targetOffset;
        }
        // get css left top value
        // in case overlay is inside a relative container
        ghost.offset(toOffset);
        S.mix(to, {
            left: ghost.css('left'),
            top: ghost.css('top')
        });
        el.css('visibility', 'hidden');
        ghost.css(from);
        ghost.offset(fromOffset);
        self.__effectGhost = ghost;
        ghost.css('visibility', 'visible');
        ghost.animate(to, {
            Anim: effectCfg.Anim,
            duration: duration,
            easing: easing,
            complete: function () {
                self.__effectGhost = null;
                ghost.remove();
                el.css('visibility', '');
            }
        });
    }

    function processEffect(self, show, callback) {
        var el = self.$el,
            effectCfg = self.get('effect'),
            effect = effectCfg.effect || 'none',
            target = effectCfg.target;
        if (effect === 'none' && !target) {
            callback();
            return;
        }
        if (target) {
            processTarget(self, show, callback);
            return;
        }
        var duration = effectCfg.duration,
            easing = effectCfg.easing,
            index = show ? 1 : 0;
        // 队列中的也要移去
        // run complete fn to restore window's original height
        el.stop(1, 1);
        el.css({
            // must show, override box-render _onSetVisible
            'visibility': 'visible',
            // fadeIn need display none, fadeOut need display block
            'display': show ? 'none' : 'block'
        });
        var m = effect + effects[effect][index];
        el[m](duration, function () {
            el.css({
                // need compute coordinates when show, so do not use display none for hide
                'display': 'block',
                // restore to box-render _onSetVisible
                'visibility': ''
            });
            callback();
        }, easing);
    }

    /**
     * effect extension for overlay
     * @class KISSY.Overlay.Extension.Effect
     */
    function OverlayEffect() {

    }

    OverlayEffect.ATTRS = {
        /**
         * Set v as overlay 's show effect
         *
         * - v.effect (String): Default:none.
         * can be set as 'fade' or 'slide'
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
         * @member KISSY.Overlay
         */
        /**
         * @ignore
         */
        effect: {
            value: {
                effect: '',
                target: null,
                duration: 0.5,
                easing: 'easeOut'
            },
            setter: function (v) {
                var effect = v.effect;
                if (typeof effect === 'string' && !effects[effect]) {
                    v.effect = '';
                }
            }

        }
    };

    OverlayEffect.prototype = {
        __afterCreateEffectGhost: function (ghost) {
            return ghost;
        },


        /**
         * For overlay with effect, it should listen show and hide instead of afterVisibleChange.
         * @protected
         * @member KISSY.Overlay
         */
        _onSetVisible: function (v) {
            var self = this;
            // delay show and hide event after anim
            processEffect(self, v, function () {
                self.fire(v ? 'show' : 'hide');
            });
        }
    };

    return OverlayEffect;
});