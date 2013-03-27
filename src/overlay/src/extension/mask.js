/**
 * @ignore
 * mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/mask", function (S, Event) {

    /**
     * @class KISSY.Overlay.Extension.Mask
     * Mask extension class. Make component to be able to show with mask.
     */
    function Mask() {
    }

    Mask.ATTRS = {
        /**
         * Whether show mask layer when component shows and effect
         *
         * for example:
         *
         *      {
         *          // whether hide current component when click on mask
         *          closeOnClick: false,
         *          effect: 'fade', // slide
         *          duration: 0.5,
         *          easing: 'easingNone'
         *      }
         *
         * @cfg {Boolean|Object} mask
         */
        /**
         * @ignore
         */
        mask: {
            view: 1
        },
        /**
         * Mask node of current component.
         * @type {KISSY.NodeList}
         * @property maskNode
         * @readonly
         */
        /**
         * @ignore
         */
        maskNode: {
            view: 1
        }
    };

    var NONE = 'none',
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function processMask(mask, el, show, view) {

        var effect = mask.effect || NONE;

        if (effect == NONE) {
            view.ksSetMaskVisible(show);
            return;
        }

        // no inline style, leave it to anim(fadeIn/Out)
        view.ksSetMaskVisible(show);

        var duration = mask.duration,
            easing = mask.easing,
            m,
            index = show ? 1 : 0;

        // run complete fn to restore window's original height
        el.stop(1, 1);

        el.css('display', show ? NONE : 'block');

        m = effect + effects[effect][index];

        el[m](duration, function () {
            el.css('display', '');
        }, easing);
    }

    // for augment, no need constructor
    Mask.prototype = {

        __bindUI: function () {
            var self = this,
                maskNode,
                mask,
                el = self.get('el'),
                view = self.get("view");
            if (mask = self.get("mask")) {
                maskNode = self.get('maskNode');
                if (mask['closeOnClick']) {
                    maskNode.on(Event.Gesture.tap, self.close, self);
                }
                self.on('afterVisibleChange', function (e) {
                    var v;
                    if (v = e.newVal) {
                        var elZIndex = parseInt(el.css('z-index')) || 1;
                        maskNode.css('z-index', elZIndex - 1);
                    }
                    processMask(mask, maskNode, v, view)
                });
            }
        }
    };


    return Mask;
}, {requires: ["event"]});