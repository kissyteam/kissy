/**
 * @ignore
 * effect for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/extension/overlay-effect', function (S) {

    var NONE = 'none',
        BLOCK = 'block',
        HIDDEN = 'hidden',
        VISIBLE = 'visible',
        DURATION = 0.5,
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function getGhost(self) {
        var el = self.get("el"),
            ghost = el.clone(true);

        ghost.css({
            visibility: 'visible',
            overflow: HIDDEN
        }).addClass(self.get('prefixCls') + 'overlay-ghost');

        return self.__afterCreateEffectGhost(ghost);
    }

    function processTarget(self, show, callback) {

        if (self.__effectGhost) {
            self.__effectGhost.stop(1, 1);
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

        el.css('visibility', HIDDEN);

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
                el.css('visibility','');
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
            index = show ? 1 : 0;
        // 队列中的也要移去
        // run complete fn to restore window's original height
        el.stop(1, 1);
        el.css({
            // must show, override box-render _onSetVisible
            "visibility": VISIBLE,
            // fadeIn need display none, fadeOut need display block
            "display": show ? NONE : BLOCK
        });
        var m = effect + effects[effect][index];
        el[m](duration, function () {
            el.css({
                // need compute coordinates when show, so do not use display none for hide
                "display": BLOCK,
                // restore to box-render _onSetVisible
                "visibility": ''
            });
            callback();
        }, easing);
    }

    function OverlayEffect() {

    }

    OverlayEffect.ATTRS = {
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
         * @member KISSY.Overlay
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

        }
    };

    // for augment, no need constructor
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
            if (self.get('rendered')) {
                // delay show and hide event after anim
                processEffect(self, v, function () {
                    self.fire(v ? 'show' : 'hide');
                });
            }
        }

    };

    return OverlayEffect;

});